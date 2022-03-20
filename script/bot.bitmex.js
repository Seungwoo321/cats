'use strict'
require('../dist/config')
const BitMEXClient = require('bitmex-realtime-api')
const dataForge = require('data-forge')
const { Influx2 } = require('../dist/lib/influx2')
const { trading } = require('../dist/lib/trade/bitmex')
const strategy = require('../strategy')
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
    client.addStream(symbol, 'tradeBin1h', async function (data, symbol) {
        const measurement = `${symbol}_${timeframe}`
        try {
            const items = data.map(item => ({
                symbol,
                time: item[0],
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
                volume: item[5]
            }))
            const bar = items[0]
            console.info(bar.symbol + ': ' + bar.timestamp)
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
