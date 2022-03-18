require('./bot/dist/config/env')
const BitMEXClient = require('bitmex-realtime-api')
const { Influx2 } = require('./bot/dist/lib/influx2')
const { bitmex } = require('../src')
const strategy = require('./strategy')
const args = process.argv.slice()
args.shift()
args.shift()
start(args[0], args[1], args[2])

function start (symbol, timeframe, strategyName) {
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
    client.addStream(symbol, 'tradeBin1h', async function (data, symbol, tableName) {
        const key = symbol.replace('/', '')
        const measurement = `${key}_${timeframe}`.toLowerCase()
        try {
            const db = new Influx2()
            await db.importData(measurement, key, data[0])
            const candles = await db.fetchCandles(measurement, key, { start: '-30d' })
            const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
            await bitmex(symbol, strategy[strategyName], inputSeries)
        } catch (error) {
            console.error(error)
            console.log('\\nFinished ERROR')
        }
    })
}
