require('../src/config')
const { Influx2 } = require('../src/lib/influx2')

jest.useRealTimers();

describe('Influx2 Flux Query', function () {
    it('ohlcv', async () => {
        expect.assertions(3)
        const db = new Influx2()
        const measurement = 'BTC/USD:BTC_1h'
        const symbol = 'BTC/USD:BTC'
        const results = await db.fetchCandles('candles', measurement, symbol, { start: '-30d' })
        const prevBar = results[results.length - 2]
        const bar = results[results.length - 1]
        expect(bar.open).toBe(prevBar.close)
        expect(bar.high).toBeGreaterThanOrEqual(bar.open)
        expect(bar.low).toBeLessThanOrEqual(bar.open)
    })
    it('ohlcv with Stochastic', async () => {
        expect.assertions(5)
        const db = new Influx2()
        const measurement = 'BTC/USD:BTC_1h'
        const symbol = 'BTC/USD:BTC'
        const n = 5
        const m = 3
        const t = 3
        const results = await db.fetchCandleWithStochastic('candles', measurement, symbol, { start: '-1d', stop: '0d', n, m, t })
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
        const measurement = 'BTC/USD:BTC_1h'
        const symbol = 'BTC/USD:BTC'
        const n = 40
        const std = 0.5
        const results = await db.fetchCandleWithBolingerBands('candles', measurement, symbol, { start: '-2d', stop: '0d', n, std })
        const prevBar = results[results.length - 2]
        const bar = results[results.length - 1]
        expect(bar.open).toBe(prevBar.close)
        expect(bar.high).toBeGreaterThanOrEqual(bar.open)
        expect(bar.low).toBeLessThanOrEqual(bar.open)
        expect(bar.upper).toBeGreaterThanOrEqual(bar.middle)
        expect(bar.lower).toBeLessThanOrEqual(bar.middle)
    })

})
