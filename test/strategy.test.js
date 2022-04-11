require('../config')
const moment = require('moment')
const { Influx2 } = require('../lib/influx2')
const strategy = require('../strategy/a')
const dataForge = require('data-forge')

it('strategy prepIndicators', async () => {
    expect.assertions(1)
    const measurement = 'BCH/USD:BTC_1h'
    const symbol = 'BCH/USD:BTC'
    const db = new Influx2()
    const start = new Date(moment().subtract(1, 'year').format('YYYY-MM-DD')).getTime() / 1000
    const stop = new Date(moment().format('YYYY-MM-DD')).getTime() / 1000
    const candles = await db.fetchCandles('candles', measurement, symbol, { start, stop })
    const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
    const indicatorsSeries = strategy.prepIndicators({ parameters: {}, inputSeries })
    
    expect(indicatorsSeries.toArray().length).toBeLessThanOrEqual(inputSeries.toArray().length)
})