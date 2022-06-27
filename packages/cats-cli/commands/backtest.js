const inquirer = require('inquirer')
const backtestPrompt = require('../util/prompt/backtest')
const validationPrompt = require('../util/prompt/validationPrompt')
const { dataForge, grademark, debug } = require('@cats/shared-utils')
const gqlService = require('@cats/helper-gql').service
const strategyModule = require('@cats/helper-strategy')
const { backtest, analyze } = grademark
const logger = debug('cats:backtest')
inquirer.registerPrompt('datepicker', require('inquirer-datepicker'))

async function backtestOfGrademark (name, options) {
    try {
        const promptOptions = await inquirer.prompt(backtestPrompt(options))
        const fullOptions = Object.assign({}, options, promptOptions)
        
        logger(JSON.stringify(fullOptions))
        console.log(fullOptions)
        if (fullOptions.exchangeMode === 'test' && !validationPrompt.enableTestExchange(fullOptions.exchangeId)) {
            throw new Error(`${fullOptions.exchangeId} is not supported test mode`)
        }

        if (validationPrompt.supportableExchange(fullOptions.exchangeId)) {

            const candles = await gqlService.getCandles(
                fullOptions.token,
                fullOptions.exchangeId,
                fullOptions.exchangeMode,
                fullOptions.symbol,
                fullOptions.timeframe,
                Math.floor(fullOptions.startDate.getTime() / 1000),
                Math.ceil(fullOptions.endDate.getTime() / 1000)
            )
            if (!candles.length) {
                throw new Error('Not enough candle data.')
            }
            let inputSeries = new dataForge.DataFrame(candles).setIndex('time')
            const trades = backtest(strategyModule[fullOptions.strategy], inputSeries)
            const startingCapital = fullOptions.capital
            const analysis = analyze(startingCapital, trades)
            console.table(trades)
            console.log(analysis)
        }
    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return backtestOfGrademark(...args).catch(err => {
        console.log()
        console.log(err?.response?.errors || err)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}
