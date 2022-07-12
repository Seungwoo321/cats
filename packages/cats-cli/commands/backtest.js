const inquirer = require('inquirer')
const backtestPrompt = require('../util/prompt/backtest')
const validationPrompt = require('../util/prompt/validationPrompt')
const { dataForge, grademark, debug } = require('@cats/shared-utils')
const gqlService = require('@cats/helper-gql')
const strategyModule = require('@cats/helper-strategy')
const { backtest, analyze } = grademark
const logger = debug('cats:backtest')
inquirer.registerPrompt('datepicker', require('inquirer-datepicker'))

async function backtestOfGrademark (options) {
    try {
        const promptOptions = await inquirer.prompt(backtestPrompt(options))
        const fullOptions = Object.assign({}, options, promptOptions)
        logger(JSON.stringify(fullOptions))
        if (fullOptions.exchangeMode === 'test' && !validationPrompt.enableTestExchange(fullOptions.exchangeId)) {
            throw new Error(`${fullOptions.exchangeId} is not supported test mode`)
        }

        if (validationPrompt.supportableExchange(fullOptions.exchangeId)) {
            if (typeof fullOptions.startDate === 'string') {
                fullOptions.startDate = new Date(fullOptions.startDate)
            }
            if (typeof fullOptions.endDate === 'string') {
                fullOptions.endDate = new Date(fullOptions.endDate)
            }
            const candles = await gqlService.service.getCandles(
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
            const startingCapital = Number(fullOptions.capital)
            const analysis = analyze(startingCapital, trades)
            console.table(trades.map(item => {
                return {
                    direction: item.direction,
                    entryTime: item.entryTime,
                    entryPrice: item.entryPrice,
                    exitTime: item.exitTime,
                    exitPrice: item.exitPrice,
                    profit: item.profit,
                    profitPct: item.profitPct,
                    growth: item.growth,
                    riskPct: item.riskPct,
                    // riskSeries: item.riskSeries,
                    // rmultiple: item.rmultiple,
                    holdingPeriod: item.holdingPeriod,
                    exitReason: item.exitReason,
                    stopPrice: item.stopPrice,
                    // stopPriceSeries: item.stopPriceSeries,
                    // profitTarget: item.profitTarget

                }
            }))
            console.log(analysis)
        }
    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return backtestOfGrademark(...args).catch(err => {
        console.log(err?.response?.errors || err)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}
