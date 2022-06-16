const { bitmex } = require('@cats/helper-trading')
const gqlService = require('@cats/helper-gql').service
const { config } = require('@cats/config')
const moment = require('moment')
const BitMEXClient = require('bitmex-realtime-api')
const dataForge = require('data-forge')
const strategyModule = require('@cats/helper-strategy')


module.exports = async ({ symbol, timeframe, strategy }, skip) => {
    const c = config()
    const isTestMode = c.EXCHANGE_MODE === 'test'
    if (isTestMode) {
        console.log()
        console.log('test mode: ' + isTestMode)
        console.log()
    }
    const client = new BitMEXClient({
        testnet: isTestMode,
        maxTableLen: 1,
        apiKeyID: c.EXCHANGE_API_KEY,
        apiKeySecret: c.EXCHANGE_SECRET_KEY
    })
    let target = null
    if (isTestMode) {
        target = symbol === 'BTC/USD:BTC' ? 'XBTUSD' : symbol.split(':')[0].replace('/', '')
    }
    client.addStream(target, `tradeBin${timeframe}`, async function (data) {
        console.info(data[0].symbol + ': ' + data[0].timestamp)
        if (skip) {
            console.log('first skip...')
            skip = false
            return
        }
        try {
            const items = data.map(item => ({
                time: new Date(item.timestamp),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume
            }))
            const bar = items[0]
            const start = new Date(moment().subtract(1, 'month').format('YYYY-MM-DD')).getTime() / 1000
            const stop = new Date(moment().format('YYYY-MM-DD')).getTime() / 1000
            await gqlService.updateCandle(c.INFLUX2_TOKEN, c.EXCHANGE_ID, c.EXCHANGE_MODE, symbol, timeframe, bar)
            const candles = await gqlService.getCandles(c.INFLUX2_TOKEN, c.EXCHANGE_ID, c.EXCHANGE_MODE, symbol, timeframe, start, stop)
            const inputSeries = new dataForge.DataFrame(candles).setIndex('time')
            await bitmex.trading(symbol, strategyModule[strategy], inputSeries)
        } catch (error) {
            if (error.response) {
                const errors = error.response.errors
                errors.forEach((error) => {
                    console.error(`tradeBin${timeframe}`, 'Error Message: ' + error.message)
                    console.error(error.extensions)
                })
            } else {
                console.log(error)
            }
            console.log('\nFinished ERROR')
        }
    })

    client.addStream(target, 'execution', async function (data) {
        if (!data.length) return
        try {
            const item = data[0]
            await bitmex.executionTrading(symbol, {
                symbol: symbol,
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
                text: item.text
            }, item.execInst)
        } catch (error) {
            if (error.response) {
                const errors = error.response?.errors
                errors.forEach(error => {
                    console.error('execution', 'Error Message: ' + error.message)
                    console.error(error.extensions)
                })
            } else {
                console.log(error)
            }
            console.log('\nFinished ERROR')
        }
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
}

