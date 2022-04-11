require('../config')
const { Influx2 } = require('../lib/influx2')
const moment = require('moment')
jest.useRealTimers();

describe('Influx2 Flux Query', function () {
    it('ohlcv', async () => {
        expect.assertions(3)
        const db = new Influx2()
        const measurement = 'BCH/USD:BTC_1h'
        const symbol = 'BCH/USD:BTC'
        const start = new Date(moment.utc().subtract(2, 'day').format('YYYY-MM-DD')).getTime() / 1000
        const stop = new Date(moment.utc().format('YYYY-MM-DD')).getTime() / 1000
        const results = await db.fetchCandles('candles', measurement, symbol, { start, stop })
        const prevBar = results[results.length - 2]
        const bar = results[results.length - 1]
        expect(bar.open).toBe(prevBar.close)
        expect(bar.high).toBeGreaterThanOrEqual(bar.open)
        expect(bar.low).toBeLessThanOrEqual(bar.open)
    })
    it('ohlcv with Stochastic', async () => {
        expect.assertions(5)
        const db = new Influx2()
        const measurement = 'BCH/USD:BTC_1h'
        const symbol = 'BCH/USD:BTC'
        const n = 5
        const m = 3
        const t = 3
        const start = new Date(moment.utc().subtract(2, 'day').format('YYYY-MM-DD')).getTime() / 1000
        const stop = new Date(moment.utc().format('YYYY-MM-DD')).getTime() / 1000
        const results = await db.fetchCandleWithStochastic('candles', measurement, symbol, { start, stop, n, m, t })
        const prevBar = results[results.length - 2]
        const bar = results[results.length - 1]
        expect(bar.open).toBe(prevBar.close)
        expect(bar.high).toBeGreaterThanOrEqual(bar.open)
        expect(bar.low).toBeLessThanOrEqual(bar.open)
        expect(bar.k).toBeGreaterThanOrEqual(0)
        expect(bar.d).toBeGreaterThanOrEqual(0)
    })
    it('ohlcv with BolingerBand', async () => {
        expect.assertions(5)
        const db = new Influx2()
        const measurement = 'BCH/USD:BTC_1h'
        const symbol = 'BCH/USD:BTC'
        const n = 40
        const std = 0.5
        const start = new Date(moment.utc().subtract(2, 'day').format('YYYY-MM-DD')).getTime() / 1000
        const stop = new Date(moment.utc().format('YYYY-MM-DD')).getTime() / 1000
        const results = await db.fetchCandleWithBolingerBands('candles', measurement, symbol, { start, stop, n, std })
        const prevBar = results[results.length - 2]
        const bar = results[results.length - 1]
        expect(bar.open).toBe(prevBar.close)
        expect(bar.high).toBeGreaterThanOrEqual(bar.open)
        expect(bar.low).toBeLessThanOrEqual(bar.open)
        expect(bar.upper).toBeGreaterThanOrEqual(bar.middle)
        expect(bar.lower).toBeLessThanOrEqual(bar.middle)
    })
})
