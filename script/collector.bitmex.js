'use strict'
require('../dist/config')
const { Influx2 } = require('../dist/lib/influx2')
const ccxt = require('ccxt')
const prompts = require('prompts')
const cliProgress = require('cli-progress')
const colors = require('ansi-colors')

const toDate = new Date()
const endDate = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate(), toDate.getUTCHours(), toDate.getUTCMinutes())).getTime()

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
    return Math.ceil(count) + 1
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

async function collecting (symbol, timeframe, startDate, total, data) {
    try {
        // const index = 4 // [ timestamp, open, high, low, close, volume ]
        // eslint-disable-next-line new-cap
        const exchange = await new ccxt.bitmex()
        let since = startDate.getTime()
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
        let i = 0
        while (since) {
            await sleep(exchange.rateLimit)
            const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, since)
            if (ohlcv.length) {
                if (i === 0) {
                    i = total - getRequestCount(endDate - ohlcv[ohlcv.length - 1][0], timeframe) + 1
                } else {
                    i++
                    b1.increment()
                }
                b1.update(i)
                since = ohlcv[ohlcv.length - 1][0]
                if (ohlcv.length < 100) {
                    since = null
                }
                data.pop()
                data = data.concat(ohlcv)
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
    const { symbol, startDate, timeframe, value } = await prompts(questions, { onCancel })
    if (value) {
        const total = getRequestCount(endDate - startDate, timeframe)
        b1.start(total, 0, {
            speed: 'N/A'
        })
        const db = new Influx2()
        const result = await collecting(symbol, timeframe, startDate, total, [])
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
        })
        try {
            await db.importData('candles', measurement, symbol, items)
            console.log('FINISHED')
            const results = await db.fetchCandles('candles', measurement, symbol, { start: '-30d' })
            console.log(results)
        } catch (error) {
            console.error(error)
            console.log('\\nFinished ERROR')
        }
    } else {
        process.exit(1)
    }
})()
