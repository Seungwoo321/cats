const { DataSource } = require('apollo-datasource')
class CandleAPI extends DataSource {
    constructor (store) {
        super()
        this.store = store
        this.bucketName = 'candle'
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
        const org = `${exchange}${mode === 'test' ? '.test': ''}`
        const measurement = `${symbol}_${timeframe}`
        return this.store.fetchCandles(org, this.bucketName, measurement, symbol, { start, stop })
    }

    async updateCandle ({ symbol, timeframe, bar }) {
        const org = `${exchange}${mode === 'test' ? '.test' : ''}`
        const measurement = `${symbol}_${timeframe}`
        return db.addCandleData(org, this.bucketName, measurement, symbol, bar)
    }
}

module.exports = CandleAPI
