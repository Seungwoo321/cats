'use strict'
require('module-alias/register')
require('@cats/config')
const { backtest, analyze } = require('grademark')
const dataForge = require('data-forge')
const { Influx2 } = require('@cats/helperinflux2')
const strategy = require('@cats/helper-strategy')
const args = process.argv.slice()
args.shift()
args.shift()

; (async function main () {
    const symbol = args[0]
    const timeframe = args[1]
    const strategyName = args[2]
    const start = new Date(args[3]).getTime() / 1000
    const stop = new Date(args[4]).getTime() / 1000
    const measurement = `${symbol}_${timeframe}`
    // console.log(symbol, timeframe, strategyName, start, stop, measurement)
    const db = new Influx2()
    const candles = await db.fetchCandles('candles', measurement, symbol, { start, stop })
    const inputSeries = new dataForge.DataFrame(candles).setIndex('time')

    const trades = backtest(strategy[strategyName], inputSeries)
    console.log(`Made ${trades.length} trades!`)
    const startingCapital = 10000
    const analysis = analyze(startingCapital, trades)
    // console.table(trades)
    console.log(analysis)
    return {
        trades,
        analysis
    }
})()
