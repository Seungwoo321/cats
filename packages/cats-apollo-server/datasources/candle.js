const { DataSource } = require('apollo-datasource')
class CandleAPI extends DataSource {

    constructor (store) {
        super()
        this.store = store
        this.org = 'cats'
        this.USE_TEST_NET = 'test'
    }

    initialize (config) {
        this.context = config.context
    }

    /**
     *
     * @param {string} symbol
     * @param {string} timeframe
     * @returns
     */
    async getCandles ({ exchange, mode, symbol, timeframe, start, stop }) {        
        const bucketName = `${exchange}${mode === this.USE_TEST_NET ? `.${this.USE_TEST_NET}`: ''}`
        const measurement = `${symbol}_${timeframe}`
        return this.store.fetchCandles(this.org, bucketName, measurement, symbol, { start, stop })
    }

    async updateCandle ({ exchange, mode, symbol, timeframe, bar }) {
        const bucketName = `${exchange}${mode === this.USE_TEST_NET ? `.${this.USE_TEST_NET}` : ''}`
        const measurement = `${symbol}_${timeframe}`
        return this.store.addCandle(this.org, bucketName, measurement, symbol, bar)
    }

    async importCandles ({ exchange, mode, symbol, timeframe, bars }) {
        const bucketName = `${exchange}${mode === this.USE_TEST_NET ? `.${this.USE_TEST_NET}` : ''}`
        const measurement = `${symbol}_${timeframe}`
        return this.store.importCandles(this.org, bucketName, measurement, symbol, bars)
    }
}

module.exports = CandleAPI
