'use strict'
require('module-alias/register')
require('@config')
const { Influx2 } = require('@cats/helper-influx2')
const ccxt = require('ccxt')
const prompts = require('prompts')
const cliProgress = require('cli-progress')
const colors = require('ansi-colors')
const args = process.argv.slice()
args.shift()
args.shift()
const toDate = new Date()

const b1 = new cliProgress.SingleBar({
    format: 'Colleting data... |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Requsts ',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
})

const onCancel = () => {
    console.log('Never stop prompting!')
    process.exit(0)
}

const getRequestCount = (count, timeframe) => {
    switch (timeframe) {
    case '1m':
        count = count / (60 * 1000 * 100)
        break
    case '5m':
        count = count / (60 * 5 * 1000 * 100)
        break
    case '1h':
        count = count / (60 * 60 * 1000 * 100)
        break
    case '1d':
        count = count / (60 * 60 * 24 * 1000 * 100)
        break
    }
    return Math.ceil(count)
}
const questions = [
    {
        type: 'select',
        name: 'symbol',
        message: 'Please select an symbol in bitmex',
        choices: [
            {
                title: 'BTC/USD:BTC',
                value: 'BTC/USD:BTC'
            },
            {
                title: 'ETH/USD:BTC',
                value: 'ETH/USD:BTC'
            },
            {
                title: 'BCH/USD:BTC',
                value: 'BCH/USD:BTC'
            },
            {
                title: 'LTC/USD:BTC',
                value: 'LTC/USD:BTC'
            },
            {
                title: 'XRP/USD:BTC',
                value: 'XRP/USD:BTC'
            }
        ],
        initial: 0
    },
    {
        type: 'date',
        name: 'startDate',
        mask: 'YYYY-MM-DD HH:mm',
        message: 'When will you start collecting?',
        initial: new Date(Date.UTC(2017, 0, 1, 0, 0))
    },
    {
        type: 'date',
        name: 'endDate',
        mask: 'YYYY-MM-DD HH:mm',
        message: 'When will you end collecting?',
        initial: new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate(), toDate.getUTCHours(), 0))
    },
    {
        type: 'select',
        name: 'timeframe',
        message: 'Please select a time unit',
        choices: [
            {
                title: '1 min',
                value: '1m'
            },
            {
                title: '5 min',
                value: '5m'
            },
            {
                title: '1 hour',
                value: '1h'
            },
            {
                title: '1 day',
                value: '1d'
            }
        ],
        initial: 2
    },
    {
        type: 'confirm',
        name: 'value',
        message: 'Can you confirm?',
        initial: true
    }
]

async function collecting (symbol, timeframe, startTime, endTime, total, data) {
    try {
        // const index = 4 // [ timestamp, open, high, low, close, volume ]
        // eslint-disable-next-line new-cap
        const exchange = await new ccxt.bitmex()
        let since = startTime
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
        let i = 0
        while (since) {
            await sleep(exchange.rateLimit)
            const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, since)
            if (ohlcv.length === 0) {
                throw Error(`There is no data for that ${new Date(startTime).toISOString()}.`)
            }
            if (ohlcv.length > 0 && i === 0 && ohlcv[0][0] > endTime) {
                throw Error(`The start date is at least ${new Date(ohlcv[0][0]).toISOString()}.`)
            }
            if (ohlcv.length) {
                i++
                b1.increment()
                b1.update(i)
                since = ohlcv[ohlcv.length - 1][0]
                if (ohlcv.length < 100) {
                    since = null
                    console.log('\nEnd date: ' + new Date(ohlcv[ohlcv.length - 1][0]).toISOString())
                }
                data.pop()
                if (endTime <= ohlcv[ohlcv.length - 1][0]) {
                    data = data.concat(ohlcv.filter(itme => itme[0] <= endTime))
                    since = null
                    console.log('\nEnd date: ' + new Date(ohlcv[ohlcv.length - 1][0]).toISOString())
                } else {
                    data = data.concat(ohlcv)
                }
            } else {
                since = since + (60 * 60 * 24 * 1000)
            }
        }
        b1.stop()
        return data
    } catch (error) {
        b1.stop()
        console.error(error.constructor.name, error.message)
        process.exit(1)
    }
}

(async function main () {
    let userInput = {}
    if (args.length === 4) {
        userInput = {
            symbol: args[0],
            timeframe: args[1],
            startDate: new Date(args[2]),
            endDate: new Date(args[3]),
            value: true
        }
    } else {
        userInput = await prompts(questions, { onCancel })
    }
    const { symbol, startDate, endDate, timeframe, value } = userInput
    const startTime = startDate.getTime()
    const endTime = endDate.getTime()
    if (value) {
        const total = getRequestCount(endTime - startTime, timeframe)
        b1.start(total, 0, {
            speed: 'N/A'
        })
        const db = new Influx2()
        const result = await collecting(symbol, timeframe, startTime, endTime, total, [])
        const measurement = `${symbol}_${timeframe}`
        const items = result.map(item => {
            return {
                time: item[0],
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
                volume: item[5]
            }
        }).filter(item => {
            return item.time && item.open && item.high && item.low && item.close && item.volume
        })
        try {
            await db.importData('candles', measurement, symbol, items)
            console.log('FINISHED')
            const results = await db.fetchCandles('candles', measurement, symbol, { start: startTime / 1000, stop: endTime / 1000 })
            console.log(results[results.length - 1])
            process.exit(0)
        } catch (error) {
            console.error(error)
            console.log('\\nFinished ERROR')
            process.exit(1)
        }
    } else {
        process.exit(1)
    }
})()
