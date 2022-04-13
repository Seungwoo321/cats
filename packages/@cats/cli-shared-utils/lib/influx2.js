"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Influx2 = void 0;
const _config_1 = require("@config");
// eslint-disable-next-line camelcase
const { InfluxDB, Point, DEFAULT_WriteOptions, fluxDuration } = require('@influxdata/influxdb-client');
const { createOhlcvFlux, createOhlcvWithBbFlux, createOhlcvWithStochFlux } = require('./flux');
const flushBatchSize = DEFAULT_WriteOptions.batchSize;
const writeOptions = {
    batchSize: flushBatchSize + 1,
    defaultTags: {},
    flushInterval: 0,
    maxRetries: 3,
    maxRetryDelay: 15000,
    minRetryDelay: 1000,
    retryJitter: 1000
};
class Influx2 {
    constructor(options = {}) {
        this.client = new InfluxDB({ url: _config_1.INFLUX2_URL, token: _config_1.INFLUX2_TOKEN, timeout: 180 * 1000 });
        this.org = _config_1.INFLUX2_ORG;
        this.timestampsPoint = 'ms';
        this.writeOptions = Object.assign(Object.assign({}, writeOptions), options);
    }
    addData(bucket, measurement, symbol, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeApi = this.client.getWriteApi(this.org, bucket, this.timestampsPoint, this.writeOptions);
            const point = new Point(measurement)
                .tag('symbol', symbol)
                // .timestamp(new Date(item.timestamp))
                // .floatField('price', item.price)
                // .floatField('volume', item.foreignNotional)
                .timestamp(item.time)
                .floatField('open', Number(item.open))
                .floatField('high', Number(item.high))
                .floatField('low', Number(item.low))
                .floatField('close', Number(item.close))
                .floatField('volume', Number(item.volume));
            writeApi.writePoint(point);
            try {
                yield writeApi.flush();
            }
            catch (e) {
                console.error(e);
            }
            yield writeApi.close();
            return point;
        });
    }
    importData(bucket, measurement, symbol, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeApi = this.client.getWriteApi(this.org, bucket, this.timestampsPoint, this.writeOptions);
            const points = data.map(item => {
                const point = new Point(measurement)
                    .tag('symbol', symbol)
                    .timestamp(item.time)
                    .floatField('open', item.open)
                    .floatField('high', item.high)
                    .floatField('low', item.low)
                    .floatField('close', item.close)
                    .floatField('volume', item.volume);
                return point;
            });
            writeApi.writePoints(points);
            try {
                yield writeApi.flush();
            }
            catch (e) {
                console.error(e);
            }
            console.log('close writeApi: flush unwritten points, cancel scheduled retries');
            yield writeApi.close();
        });
    }
    fetchCandles(bucket, measurement, symbol, { start }) {
        return __awaiter(this, void 0, void 0, function* () {
            const startRange = fluxDuration(start);
            const query = createOhlcvFlux(bucket, measurement, symbol, startRange);
            return yield this.client
                .getQueryApi(this.org)
                .collectRows(query, (row, tableMeta) => {
                return {
                    symbol: row[tableMeta.column('symbol').index],
                    open: Number(row[tableMeta.column('open').index]),
                    high: Number(row[tableMeta.column('high').index]),
                    low: Number(row[tableMeta.column('low').index]),
                    close: Number(row[tableMeta.column('close').index]),
                    volume: Number(row[tableMeta.column('volume').index]),
                    time: row[tableMeta.column('_time').index]
                };
            });
        });
    }
    // not use
    fetchCandleWithBolingerBands(bucket, measurement, symbol, { start = '-1y', stop = '0d', n, std }) {
        return __awaiter(this, void 0, void 0, function* () {
            const startRange = fluxDuration(start);
            const stopRange = fluxDuration(stop);
            const query = createOhlcvWithBbFlux(bucket, measurement, symbol, startRange, stopRange, n, std);
            return yield this.client
                .getQueryApi(this.org)
                .collectRows(query, (row, tableMeta) => {
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
                };
            });
        });
    }
    // not use
    fetchCandleWithStochastic(bucket, measurement, symbol, { start = '-1y', stop = '0d', n, m, t }) {
        return __awaiter(this, void 0, void 0, function* () {
            const startRange = fluxDuration(start);
            const stopRange = fluxDuration(stop);
            const query = createOhlcvWithStochFlux(bucket, measurement, symbol, startRange, stopRange, n, m, t);
            return yield this.client
                .getQueryApi(this.org)
                .collectRows(query, (row, tableMeta) => {
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
                };
            });
        });
    }
}
exports.Influx2 = Influx2;
