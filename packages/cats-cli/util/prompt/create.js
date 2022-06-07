const { chalk } = require('@cats/shared-utils')
const validationPrompt = require('./validationPrompt')

module.exports = options => {
    const prompts = []
    if (!options.exchangeId || !options.exchangeApiKey || !options.exchangeSecretKey) {
        prompts.push({
            name: 'exchangeId',
            type: 'list',
            message: 'Please select the exchange to be used by ccxt',
            choices: [
                {
                    name: 'Bitmex',
                    value: 'bitmex'
                },
                {
                    name: `Upbit(${chalk.yellow('Not yet supported.')})`,
                    value: 'upbit'
                }
            ]
        })
        prompts.push({
            name: 'exchangeMode',
            when: answers => validationPrompt.enableTestExchange(answers.exchangeId),
            type: 'list',
            choices: [
                {
                    name: 'production',
                    value: 'production'
                },
                {
                    name: 'test',
                    value: 'test'
                }
            ],
            default: 0
        })
        prompts.push({
            name: 'exchangeApiKey',
            when: answers => validationPrompt.supportableExchange(answers.exchangeId),
            type: 'input',
            message: 'Enter the exchange API KEY to be used by ccxt'
        })

        prompts.push({
            name: 'exchangeSecretKey',
            when: answers => validationPrompt.supportableExchange(answers.exchangeId),
            type: 'input',
            message: 'Enter the exchange SECRET KEY to be used by ccxt'
        })
    }

    if (!options.symbol) {
        prompts.push({
            type: 'list',
            name: 'symbol',
            when: answers => validationPrompt.isExchangeBitmex(answers.exchangeId),
            message: 'Please select an symbol',
            choices: [
                {
                    name: 'BTC/USD:BTC',
                    value: 'BTC/USD:BTC'
                },
                {
                    name: 'ETH/USD:BTC',
                    value: 'ETH/USD:BTC'
                },
                {
                    name: 'BCH/USD:BTC',
                    value: 'BCH/USD:BTC'
                },
                {
                    name: 'LTC/USD:BTC',
                    value: 'LTC/USD:BTC'
                },
                {
                    name: 'XRP/USD:BTC',
                    value: 'XRP/USD:BTC'
                }
            ],
            default: 0
        })
    }

    if (!options.timeframe) {
        prompts.push({
            type: 'list',
            name: 'timeframe',
            when: answers => validationPrompt.supportableExchange(answers.exchangeId),
            message: 'Please select a time unit',
            choices: [
                {
                    name: '1 min',
                    value: '1m'
                },
                {
                    name: '5 min',
                    value: '5m'
                },
                {
                    name: '1 hour',
                    value: '1h'
                },
                {
                    name: '1 day',
                    value: '1d'
                }
            ],
            default: 0
        })
    }

    if (!options.strategy) {
        const strategyModule = require('@cats/helper-strategy')

        const choices = Object.keys(strategyModule).map(key => {
            return {
                name: key,
                value: key
            }
        })

        prompts.push({
            type: 'list',
            name: 'strategy',
            when: answers => validationPrompt.supportableExchange(answers.exchangeId),
            message: 'Please select a strategy name',
            choices,
            default: 0
        })
    }

    return prompts
}