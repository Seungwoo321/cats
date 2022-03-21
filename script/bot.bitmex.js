'use strict'
require('./dist/config')
const BitMEXClient = require('bitmex-realtime-api')
const dataForge = require('data-forge')
const { Influx2 } = require('./dist/lib/influx2')
const { trading } = require('./dist/lib/trade/bitmex')
const strategy = require('./strategy')
const args = process.argv.slice()
args.shift()
args.shift()

; (async function bot () {
    const symbol = args[0]
    const timeframe = args[1]
    const strategyName = args[2]

    const client = new BitMEXClient({
        testnet: false,
        maxTableLen: 100
    })
    client.on('initialize', () => {
        console.log('trade stream start...')
    })
    client.on('error', (error) => {
        console.error(error)
    })
    /**
     *
     * [
     *   {
     *       timestamp: '2022-03-20T21:00:00.000Z',
     *       symbol: 'BCHUSD',
     *       open: 319.15,
     *       high: 321.65,
     *       low: 318.4,
     *       close: 318.55,
     *       trades: 113,
     *       volume: 11882,
     *       vwap: 319.68,
     *       lastSize: 105,
     *       turnover: 379842785,
     *       homeNotional: 492.8835830491001,
     *       foreignNotional: 157565.787177658
     *   }
     * ]
     */
    client.addStream(symbol, 'tradeBin1h', async function (data, symbol) {
        console.info(data[0].symbol + ': ' + data[0].timestamp)
        const measurement = `${symbol}_${timeframe}`
        try {
            const items = data.map(item => ({
                symbol,
                time: new Date(item.timestamp),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume
            }))
            const bar = items[0]
            const db = new Influx2()
            await db.addData('candles', measurement, symbol, bar)
            const candles = await db.fetchCandles('candles', measurement, symbol, { start: '-30d' })
            const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
            await trading(symbol, strategy[strategyName], inputSeries)
        } catch (error) {
            console.error(error)
            console.log('\nFinished ERROR')
        }
    })
})()
