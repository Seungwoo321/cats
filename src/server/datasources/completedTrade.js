const { DataSource } = require('apollo-datasource')

class CompletedTrade extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async findTrading ({ tradingId }) {
        const res = await this.store.findAll({
            where: {
                tradingId
            }
        })
        return res && res.length ? res[0].get() : false
    }

    async findTradingByOrderId ({ orderId }) {
        const res = await this.store.findAll({
            where: {
                orderId
            }
        })
        return res && res.length ? res[0].get() : false
    }

    async findTradingBySymbol ({ symbol }) {
        const res = await this.store.findAll({
            where: {
                symbol
            }
        })
        return res && res.length ? res[0].get() : false
    }

    async updateTrading ({ values }) {
        const res = await this.store.upsert(values, {
            where: {
                orderId: values.orderId
            }
        })
        if (res && res.length && res[0] === 1) {
            return await this.findTradingByOrderId({ orderId: values.orderId })
        }
        return false
    }
}

module.exports = CompletedTrade
