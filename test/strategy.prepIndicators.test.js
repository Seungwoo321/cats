require('../src/config')
const { Influx2 } = require('../src/lib/influx2')
const strategy = require('../strategy/a')
const dataForge = require('data-forge')

it('strategy prepIndicators', async () => {
    expect.assertions(1)
    const measurement = 'BCH/USD:BTC_1h'
    const symbol = 'BCH/USD:BTC'
    const db = new Influx2()
    const candles = await db.fetchCandles('candles', measurement, symbol, { start: '-30d' })
    const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
    const indicatorsSeries = strategy.prepIndicators({ parameters: {}, inputSeries })
    
    expect(indicatorsSeries.toArray().length).toBeLessThanOrEqual(inputSeries.toArray().length)
})