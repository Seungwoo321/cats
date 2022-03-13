require('../src/config/env')
const { Influx2 } = require('../src/lib/influx2')

it('Influx2 Flux Query BolingerBand', async () => {
    expect.assertions(1)
    const db = new Influx2()
    const measurement = 'BTC/USD:BTC_1h'
    const symbol = 'BTC/USD:BTC'
    const n = 40
    const std = 0.5
    const results = await db.fetchCandleWithBolingerBands('bitmex', measurement, symbol, { start: '-2d', stop: '0d', n, std })
    expect(results.length).toBeGreaterThanOrEqual(1)
})

