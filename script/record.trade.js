require('module-alias/register')
require('@config')
const BitMEXClient = require('bitmex-realtime-api')
const { record } = require('@lib/record/bitmex')
const args = process.argv.slice()
args.shift()
args.shift()

; (async function logger () {
    const symbol = args[0]
    const client = new BitMEXClient({
        testnet: false,
        maxTableLen: 1,
        apiKeyID: process.env.EXCHANGE_API_KEY,
        apiKeySecret: process.env.EXCHANGE_SECRET_KEY
    })
    client.on('initialize', () => {
        console.log('execution stream start...')
    })
    client.on('error', (error) => {
        console.error(error)
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
    // symbol.split(':')[0].replace('/', '')
    client.addStream('BCHUSD', 'execution', async function (data, _, __) {
        try {
            await record(symbol, {
                orderId: data.orderID,
                lastQty: data.lastQty,
                orderQty: data.orderQty,
                leavesQty: data.leavesQty,
                lastPrice: data.lastPrice,
                price: data.price,
                avgPrice: data.avgPrice,
                stopPrice: data.stopPrice,
                side: data.side,
                ordType: data.ordType,
                ordStatus: data.ordStatus,
                currency: data.currency,
                homeNotional: data.homeNotional,
                time: data.timestamp,
                tradingId: null
            })
        } catch (error) {
            const errors = error.response.errors
            errors.forEach(error => {
                console.error('Error Message: ' + error.message)
                console.error(error.extensions)
            })
            console.log('\nFinished ERROR')
        }
    })
})()
