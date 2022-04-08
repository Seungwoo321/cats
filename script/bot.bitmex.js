'use strict'
require('module-alias/register')
require('@config')
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
    client.addStream(symbol.split(':')[0].replace('/', ''), 'tradeBin1h', async function (data, _) {
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
    /**
     * [
     *   {
     *     "execID": "0193e879-cb6f-2891-d099-2c4eb40fee21",
     *     "orderID": "00000000-0000-0000-0000-000000000000",
     *     "clOrdID": "",
     *     "clOrdLinkID": "",
     *     "account": 2,
     *     "symbol": "XBTUSD",
     *     "side": "Sell",
     *     "lastQty": 1,
     *     "lastPx": 1134.37,
     *     "underlyingLastPx": null,
     *     "lastMkt": "XBME",
     *     "lastLiquidityInd": "RemovedLiquidity",
     *     "simpleOrderQty": null,
     *     "orderQty": 1,
     *     "price": 1134.37,
     *     "displayQty": null,
     *     "stopPx": null,
     *     "pegOffsetValue": null,
     *     "pegPriceType": "",
     *     "currency": "USD",
     *     "settlCurrency": "XBt",
     *     "execType": "Trade",
     *     "ordType": "Limit",
     *     "timeInForce": "ImmediateOrCancel",
     *     "execInst": "",
     *     "contingencyType": "",
     *     "exDestination": "XBME",
     *     "ordStatus": "Filled",
     *     "triggered": "",
     *     "workingIndicator": false,
     *     "ordRejReason": "",
     *     "simpleLeavesQty": 0,
     *     "leavesQty": 0,
     *     "simpleCumQty": 0.001,
     *     "cumQty": 1,
     *     "avgPx": 1134.37,
     *     "commission": 0.00075,
     *     "tradePublishIndicator": "DoNotPublishTrade",
     *     "multiLegReportingType": "SingleSecurity",
     *     "text": "Liquidation",
     *     "trdMatchID": "7f4ab7f6-0006-3234-76f4-ae1385aad00f",
     *     "execCost":88155,
     *     "execComm":66,
     *     "homeNotional": -0.00088155,
     *     "foreignNotional": 1,
     *     "transactTime":"2017-04-04T22:07:46.035Z",
     *     "timestamp":"2017-04-04T22:07:46.035Z"
     *   }
     * ]
     */
    client.addStream('BCHUSD', 'execution', async function (data, _, __) {
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
