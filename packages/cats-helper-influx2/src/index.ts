
import { IBar } from '@cats/types'
import config from '@cats/config'

const { INFLUX2_URL, INFLUX2_TOKEN } = config()
const { InfluxDB, Point, DEFAULT_WriteOptions } = require('@influxdata/influxdb-client')
const { createOhlcvFlux, createOhlcvWithBbFlux, createOhlcvWithStochFlux } = require('./flux')
const flushBatchSize = DEFAULT_WriteOptions.batchSize
const writeOptions = {
    batchSize: flushBatchSize + 1,
    defaultTags: {},
    flushInterval: 0,
    maxRetries: 3,
    maxRetryDelay: 15000,
    minRetryDelay: 1000,
    retryJitter: 1000
}

class Influx2 {
    private client: any
    private timestampsPoint: string
    private writeOptions: any

    constructor (options: any = {}) {
        this.client = new InfluxDB({ url: INFLUX2_URL, token: INFLUX2_TOKEN, timeout: 180 * 1000 })
        this.timestampsPoint = 'ms'
        this.writeOptions = { ...writeOptions, ...options }
    }

    async addCandle (org: string, bucket: string, measurement: string, symbol: string, bar: IBar) {
        const writeApi = this.client.getWriteApi(org, bucket, this.timestampsPoint, this.writeOptions)
        const point = new Point(measurement)
            .tag('symbol', symbol)
            // .timestamp(new Date(item.timestamp))
            // .floatField('price', item.price)
            // .floatField('volume', item.foreignNotional)
            .timestamp(bar.time)
            .floatField('open', Number(bar.open))
            .floatField('high', Number(bar.high))
            .floatField('low', Number(bar.low))
            .floatField('close', Number(bar.close))
            .floatField('volume', Number(bar.volume))
        writeApi.writePoint(point)
        try {
            await writeApi.flush()
        } catch (e) {
            console.error(e)
        }
        await writeApi.close()
        return point
    }

    async importCandles (org: string, bucket: string, measurement: string, symbol: string, data: IBar[]): Promise<void> {
        const writeApi = this.client.getWriteApi(org, bucket, this.timestampsPoint, this.writeOptions)
        const points = data.map(item => {
            const point = new Point(measurement)
                .tag('symbol', symbol)
                .timestamp(item.time)
                .floatField('open', item.open)
                .floatField('high', item.high)
                .floatField('low', item.low)
                .floatField('close', item.close)
                .floatField('volume', item.volume)
            return point
        })
        writeApi.writePoints(points)
        try {
            await writeApi.flush()
        } catch (e) {
            console.error(e)
        }
        console.log('close writeApi: flush unwritten points, cancel scheduled retries')
        await writeApi.close()
    }

    async fetchCandles (org: string, bucket: string, measurement: string, symbol: string, { start, stop }: { start: number, stop: number }): Promise<void> {
        const query = createOhlcvFlux(bucket, measurement, symbol, start, stop)
        return await this.client
            .getQueryApi(org)
            .collectRows(query, (row: any, tableMeta: any) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: Number(row[tableMeta.column('open').index]),
                    high: Number(row[tableMeta.column('high').index]),
                    low: Number(row[tableMeta.column('low').index]),
                    close: Number(row[tableMeta.column('close').index]),
                    volume: Number(row[tableMeta.column('volume').index]),
                    time: row[tableMeta.column('_time').index]
                }
            })
    }

    // Unused
    async fetchCandleWithBolingerBands (org: string, bucket: string, measurement: string, symbol: string, { start, stop, n, std } : { start: number, stop: number, n: number, std: number }): Promise<void> {
        const query = createOhlcvWithBbFlux(bucket, measurement, symbol, start, stop, n, std)
        return await this.client
            .getQueryApi(org)
            .collectRows(query, (row: any, tableMeta: any) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: Number(row[tableMeta.column('open').index]),
                    high: Number(row[tableMeta.column('high').index]),
                    low: Number(row[tableMeta.column('low').index]),
                    close: Number(row[tableMeta.column('close').index]),
                    volume: Number(row[tableMeta.column('volume').index]),
                    middle: Number(row[tableMeta.column('middle').index]),
                    upper: Number(row[tableMeta.column('upper').index]),
                    lower: Number(row[tableMeta.column('lower').index]),
                    time: row[tableMeta.column('_time').index]
                }
            })
    }

    // Unused
    async fetchCandleWithStochastic (org: string, bucket: string, measurement: string, symbol: string, { start, stop, n, m, t }: { start: number, stop: number, n: number, m: number, t: number }): Promise<void> {
        const query = createOhlcvWithStochFlux(bucket, measurement, symbol, start, stop, n, m, t)
        return await this.client
            .getQueryApi(org)
            .collectRows(query, (row: any, tableMeta: any) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: Number(row[tableMeta.column('open').index]),
                    high: Number(row[tableMeta.column('high').index]),
                    low: Number(row[tableMeta.column('low').index]),
                    close: Number(row[tableMeta.column('close').index]),
                    volume: Number(row[tableMeta.column('volume').index]),
                    k: Number(row[tableMeta.column('k').index]),
                    d: Number(row[tableMeta.column('d').index]),
                    time: row[tableMeta.column('_time').index]
                }
            })
    }
}

export {
    Influx2
}
