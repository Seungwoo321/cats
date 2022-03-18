import { IBar } from './grademark'
import { INFLUX2_ORG, INFLUX2_URL, INFLUX2_TOKEN } from '../config'

// eslint-disable-next-line camelcase
const { InfluxDB, Point, DEFAULT_WriteOptions, fluxDuration } = require('@influxdata/influxdb-client')
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
    private org: string
    private timestampsPoint: string
    private writeOptions: any

    constructor (options: any = {}) {
        this.client = new InfluxDB({ url: INFLUX2_URL, token: INFLUX2_TOKEN, timeout: 180 * 1000 })
        this.org = INFLUX2_ORG
        this.timestampsPoint = 'ms'
        this.writeOptions = { ...writeOptions, ...options }
    }

    async addData (bucket: string, measurement: string, symbol: string, item: IBar) {
        const writeApi = this.client.getWriteApi(this.org, bucket, this.timestampsPoint, this.writeOptions)
        const point = new Point(measurement)
            .tag('symbol', symbol)
            // .timestamp(new Date(item.timestamp))
            // .floatField('price', item.price)
            // .floatField('volume', item.foreignNotional)
            .timestamp(item.time)
            .floatField('open', item.open)
            .floatField('high', item.high)
            .floatField('low', item.low)
            .floatField('close', item.close)
            .floatField('volume', item.volume)
        writeApi.writePoint(point)
        try {
            await writeApi.flush()
        } catch (e) {
            console.error(e)
        }
        await writeApi.close()
        return point
    }

    async importData (bucket: string, measurement: string, symbol: string, data: IBar[]): Promise<void> {
        const writeApi = this.client.getWriteApi(this.org, bucket, this.timestampsPoint, this.writeOptions)
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

    async fetchCandles (bucket: string, measurement: string, symbol: string, { start }: { start: string}): Promise<void> {
        const startRange = fluxDuration(start)
        const query = createOhlcvFlux(bucket, measurement, symbol, startRange)
        return await this.client
            .getQueryApi(this.org)
            .collectRows(query, (row: any, tableMeta: any) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: row[tableMeta.column('open').index],
                    high: row[tableMeta.column('high').index],
                    low: row[tableMeta.column('low').index],
                    close: row[tableMeta.column('close').index],
                    volume: row[tableMeta.column('volume').index],
                    time: row[tableMeta.column('_time').index]
                }
            })
    }

    // not use
    async fetchCandleWithBolingerBands (measurement: string, symbol: string, { start = '-1y', stop = '0d', n, std } : { start: string, stop: string, n: number, std: number }): Promise<void> {
        const startRange = fluxDuration(start)
        const stopRange = fluxDuration(stop)
        const query = createOhlcvWithBbFlux('candles', measurement, symbol, startRange, stopRange, n, std)
        return await this.client
            .getQueryApi(this.org)
            .collectRows(query, (row: any, tableMeta: any) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: row[tableMeta.column('open').index],
                    high: row[tableMeta.column('high').index],
                    low: row[tableMeta.column('low').index],
                    close: row[tableMeta.column('close').index],
                    volume: row[tableMeta.column('volume').index],
                    middle: row[tableMeta.column('middle').index],
                    upper: row[tableMeta.column('upper').index],
                    lower: row[tableMeta.column('lower').index],
                    time: row[tableMeta.column('_time').index]
                }
            })
    }

    // not use
    async fetchCandleWithStochastic (measurement: string, symbol: string, { start = '-1y', stop = '0d', n, m, t }: { start: string, stop: string, n: number, m: number, t: number }): Promise<void> {
        const startRange = fluxDuration(start)
        const stopRange = fluxDuration(stop)
        const query = createOhlcvWithStochFlux('candles', measurement, symbol, startRange, stopRange, n, m, t)
        return await this.client
            .getQueryApi(this.org)
            .collectRows(query, (row: any, tableMeta: any) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: row[tableMeta.column('open').index],
                    high: row[tableMeta.column('high').index],
                    low: row[tableMeta.column('low').index],
                    close: row[tableMeta.column('close').index],
                    volume: row[tableMeta.column('volume').index],
                    k: row[tableMeta.column('k').index],
                    d: row[tableMeta.column('d').index]
                }
            })
    }
}

export {
    Influx2
}
