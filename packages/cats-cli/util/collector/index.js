const { exchange } = require('@cats/helper-exchange')
const gqlService = require('@cats/helper-gql')

module.exports = class CollectorAPI {
    constructor (options = {}) {
        if (options.mode === 'test') {
            console.log('EXCHANGE_MODE', options.mode)
            exchange.setSandboxMode(true)
        }
        this.client = {
            gql: gqlService.service,
            exchange
        }
        this.exchangeId = options.exchangeId
        this.mode = options.mode
        this.limit = 100

    }

    async fetchOhlcvFromExchange (symbol, timeframe, since) {
        return await this.client.exchange.fetchOHLCV(symbol, timeframe, since)
    }

    async insertOhlcvToInflux2(symbol, timeframe, data) {
        return await this.client.gql.importCandles(this.exchangeId, this.mode, symbol, timeframe, data)
    }

    getExchange () {
        return this.client.exchange
    }

    getRequestCount (count, timeframe) {
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

    getNextSince (timestamp, timeframe) {
        switch (timeframe) {
            case '1m':
                timestamp = timestamp + (60 * 1000 * 100)
                break
            case '5m':
                timestamp = timestamp + (60 * 5 * 1000 * 100)
                break
            case '1h':
                timestamp = timestamp + (60 * 60 * 1000 * 100)
                break
            case '1d':
                timestamp = timestamp + (60 * 60 * 24 * 1000 * 100)
                break
        }
        return timestamp
    }

    sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

}