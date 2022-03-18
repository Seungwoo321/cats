const { DataSource } = require('apollo-datasource')

class CandleAPI extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    /**
     *
     * @param {string} bucket
     * @param {string} measurement
     * @param {string} symbol
     * @param {string} startRange
     * @returns
     */
    async getCandles (bucket, measurement, symbol, startRange) {
        return this.store.fetchCandles(bucket, measurement, symbol, { start: startRange })
    }
}

module.exports = CandleAPI
