require('../src/config/env')
const { Influx2 } = require('../src/lib/influx2')

it('Influx2 Flux Query ohlcv', async () => {
    expect.assertions(1)
    const db = new Influx2()
    const measurement = 'BTC/USD:BTC_1h'
    const symbol = 'BTC/USD:BTC'
    const results = await db.fetchCandles(measurement, symbol, { start: '-30d' })
    expect(results.length).toBeGreaterThanOrEqual(1)
})
