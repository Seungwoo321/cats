const { chalk } = require('@cats/shared-utils')
const validationPrompt = require('./validationPrompt')

module.exports = options => {
    const prompts = []
    if (!options.token) {
        prompts.push({
            name: 'token',
            type: 'input',
            message: `Enter a token to access Influx2 (${process.env.INFLUX2_URL || 'http://localhost:8086'})`
        })
    }
    if (!options.exchangeId) {
        prompts.push({
            name: 'exchangeId',
            type: 'list',
            message: 'Please select the exchange to collect',
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
    if (!options.startDate) {
        prompts.push({
            type: 'datepicker',
            name: 'startDate',
            message: 'Select a start date: ',
            format: ['YYYY', '-', 'MM', '-', 'DD', ' ', 'hh', ':', 'mm', ':', '00'],
            default: new Date('2017-01-01 00:00:00'),
        })
    }

    if (!options.endDate) {
        prompts.push({
            type: 'datepicker',
            name: 'endDate',
            message: 'Select a end date: ',
            format: ['YYYY', '-', 'MM', '-', 'DD', ' ', 'hh', ':', 'mm', ':', '00'],
            default: new Date(),
        })
    }
    return prompts
}