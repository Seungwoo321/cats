'use strict'
require('module-alias/register')
require('@config')
const moment = require('moment')
const BitMEXClient = require('bitmex-realtime-api')
const dataForge = require('data-forge')
const { Influx2 } = require('@lib/influx2')
const { trading } = require('@lib/trade/bitmex')
const { record } = require('@lib/record/bitmex')
const strategy = require('@strategy')
const args = process.argv.slice()
args.shift()
args.shift()

; (async function bot () {
    const symbol = args[0]
    const timeframe = args[1]
    const strategyName = args[2]

    const client = new BitMEXClient({
        testnet: false,
        maxTableLen: 1,
        apiKeyID: process.env.EXCHANGE_API_KEY,
        apiKeySecret: process.env.EXCHANGE_SECRET_KEY
    })
    client.on('initialize', () => {
        console.log('bitmex stream start...')
    })
    client.on('error', (error) => {
        console.error('Caught Websocket error:', error)
    })
    client.on('end', function () {
        console.error('Client closed due to unrecoverable WebSocket error. Please check errors above.')
        process.exit(1)
    })
    // HeartBeat
    setInterval(() => {
        client.socket.send('ping')
    }, 30 * 1000)

    client.addStream(symbol.split(':')[0].replace('/', ''), 'tradeBin1h', async function (data, _) {
        console.info(data[0].symbol + ': ' + data[0].timestamp)
        const measurement = `${symbol}_${timeframe}`
        if (process.env.NODE_ENV === 'development') {
            console.log(data)
            console.log('Development Test Success!')
            return
        }
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
            const start = new Date(moment().subtract(1, 'month').format('YYYY-MM-DD')).getTime() / 1000
            const stop = new Date(moment().format('YYYY-MM-DD')).getTime() / 1000
            const candles = await db.fetchCandles('candles', measurement, symbol, { start, stop })
            const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
            await trading(symbol, strategy[strategyName], inputSeries)
        } catch (error) {
            if (error.response) {
                const errors = error.response.errors
                errors.forEach(error => {
                    console.error('Error Message: ' + error.message)
                    console.error(error.extensions)
                })
            } else {
                console.log(error)
            }
            console.log('\nFinished ERROR')
        }
    })

    client.addStream(symbol.split(':')[0].replace('/', ''), 'execution', async function (data, _, __) {
        if (!data.length) return
        try {
            const item = data[0]
            await record(symbol, {
                orderId: item.orderID,
                lastQty: item.lastQty,
                orderQty: item.orderQty,
                leavesQty: item.leavesQty,
                lastPrice: item.lastPx,
                price: item.price,
                avgPrice: item.avgPx,
                stopPrice: item.stopPx,
                side: item.side,
                ordType: item.ordType,
                ordStatus: item.ordStatus,
                currency: item.currency,
                homeNotional: item.homeNotional,
                time: item.timestamp,
                text: item.text,
                tradingId: null
            })
        } catch (error) {
            if (error.response) {
                const errors = error.response.errors
                errors.forEach(error => {
                    console.error('Error Message: ' + error.message)
                    console.error(error.extensions)
                })
            } else {
                console.log(error)
            }
            console.log('\nFinished ERROR')
        }
    })
})()
