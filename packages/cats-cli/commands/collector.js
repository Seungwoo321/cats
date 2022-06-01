const inquirer = require('inquirer')
const cliProgress = require('cli-progress')
const { chalk, debug } = require('@cats/shared-utils')
const collectPrompt = require('../util/prompt/collect')
const validationPrompt = require('../util/prompt/validationPrompt')
const logger = debug('cats:collector')
inquirer.registerPrompt('datepicker', require('inquirer-datepicker'))

process.env.CATS_CLI_MODE = true

async function collect (name, options) {
    try {
        const promptOptions = await inquirer.prompt(collectPrompt(options))
        const fullOptions = Object.assign({}, options, promptOptions)
        logger(JSON.stringify(fullOptions))
        if (fullOptions.exchangeMode === 'test' && !validationPrompt.enableTestExchange(fullOptions.exchangeId)) {
            throw new Error(`${fullOptions.exchangeId} is not supported test mode`)
        }
    
        process.env.EXCHANGE_ID = fullOptions.exchangeId
        process.env.INFLUX2_TOKEN = fullOptions.token || 'cats'


        if (validationPrompt.supportableExchange(fullOptions.exchangeId)) {

            const CollectorAPI = require('../util/collector')
            const api = new CollectorAPI({
                exchangeId: fullOptions.exchangeId,
                mode: fullOptions.exchangeMode
            })
            const startTime = fullOptions.startDate.getTime()
            const endTime = fullOptions.endDate.getTime()
            const total = api.getRequestCount(endTime - startTime, fullOptions.timeframe)
    
            let since = startTime
            const b1 = new cliProgress.SingleBar({
                format: 'Colleting data... |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Requsts ',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true
            })
            let i = 0
            b1.start(total, i, {
                speed: 'N/A'
            })

            while (i < total) {
                i++
                const data = await api.fetchOhlcvFromExchange(fullOptions.symbol, fullOptions.timeframe, since)
                since = api.getNextSince(since, fullOptions.timeframe)

                const candles = data.map((items) => {
                    return {
                        time: items[0],
                        open: items[1],
                        high: items[2],
                        low: items[3],
                        close: items[4],
                        volume: items[5]
                    }
                })
                await api.insertOhlcvToInflux2(fullOptions.symbol, fullOptions.timeframe, candles)
                b1.increment()
                b1.update(i)
                await api.sleep()
            }
            b1.stop()

            console.log(`${chalk.green(`Completed Collect`)}`)

        }
    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return collect(...args).catch(err => {
        console.log(err)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}