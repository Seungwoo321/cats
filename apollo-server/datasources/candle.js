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
     * @param {string} symbol
     * @param {string} timeframe
     * @returns
     */
    async getCandles ({ symbol, timeframe, start, stop }) {
        const measurement = `${symbol}_${timeframe}`
        return this.store.fetchCandles('candles', measurement, symbol, { start, stop })
    }
}

module.exports = CandleAPI
