const { DataSource } = require('apollo-datasource')
const { Influx2 } = require('@cats/helper-influx2')

class CandleApi extends DataSource {

    constructor () {
        super()
        this.org = 'cats'
        this.USE_TEST_NET = 'test'
    }

    initialize (config) {
        this.context = config.context
    }

    /**
     * 
     * @param {*} param0 
     * @returns 
     */
    async getCandles ({ token, exchange, mode, symbol, timeframe, start, stop }) {  
        const client = new Influx2(token)
        const bucketName = `${exchange}${mode === this.USE_TEST_NET ? `.${this.USE_TEST_NET}`: ''}`
        const measurement = `${symbol}_${timeframe}`
        return client.fetchCandles(this.org, bucketName, measurement, symbol, { start, stop })
    }
    /**
     * 
     * @param {*} param0 
     * @returns 
     */
    async updateCandle ({ token, exchange, mode, symbol, timeframe, bar }) {
        const client = new Influx2(token)
        const bucketName = `${exchange}${mode === this.USE_TEST_NET ? `.${this.USE_TEST_NET}` : ''}`
        const measurement = `${symbol}_${timeframe}`
        return client.updateCandle(this.org, bucketName, measurement, symbol, bar)
    }
    /**
     * 
     * @param {*} param0 
     * @returns 
     */
    async importCandles ({ token, exchange, mode, symbol, timeframe, bars }) {
        const client = new Influx2(token)
        const bucketName = `${exchange}${mode === this.USE_TEST_NET ? `.${this.USE_TEST_NET}` : ''}`
        const measurement = `${symbol}_${timeframe}`
        return client.importCandles(this.org, bucketName, measurement, symbol, bars)
    }
}

module.exports = CandleApi
