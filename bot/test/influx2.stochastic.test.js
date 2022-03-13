require('../src/config/env')
const { Influx2 } = require('../src/lib/influx2')

it('Influx2 Flux Query Stochastic', async () => {
    const db = new Influx2()
    const measurement = 'BTC/USD:BTC_1h'
    const symbol = 'BTC/USD:BTC'
    const n = 5
    const m = 3
    const t = 3
    const results = await db.fetchCandleWithStochastic(measurement, symbol, { start: '-1d', stop: '0d', n, m, t })
    expect(results.length).toBeGreaterThanOrEqual(1)
})
