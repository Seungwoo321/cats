
'use strict'
require('module-alias/register')
require('@config')
const moment = require('moment')
const dataForge = require('data-forge')
const { Influx2 } = require('@cats/helper-influx2')
const { trading } = require('@cats/helper-trading')
const strategy = require('@cats/helper-strategy')
const args = process.argv.slice()
args.shift()
args.shift()

; (async function bot () {
    const symbol = args[0]
    const timeframe = args[1]
    const strategyName = args[2]
    const measurement = `${symbol}_${timeframe}`

    try {
        const db = new Influx2()
        const start = new Date(moment().subtract(1, 'month').format('YYYY-MM-DD')).getTime() / 1000
        const stop = new Date(moment().format('YYYY-MM-DD')).getTime() / 1000
        const candles = await db.fetchCandles('candles', measurement, symbol, { start, stop })
        // console.table(candles)
        const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
        await trading(symbol, strategy[strategyName], inputSeries)
    } catch (error) {
        console.error(error)
        console.log('\\nFinished ERROR')
    }
})()
