const { DataSource } = require('apollo-datasource')

class OrderHistory extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async findOrdersBySymbol ({ symbol }) {
        const res = await this.store.findAll({
            where: {
                symbol
            }
        })
        return res && res.length ? res[0].get() : false
    }

    async findOrdersByTrading ({ tradingId }) {
        const res = await this.store.ㄴfindAll({
            where: {
                tradingId
            }
        })
        return res && res.length ? res[0].get() : false
    }

    async updateOrder ({ values }) {
        const res = await this.store.upsert(values, {
            where: {
                tradingId: values.tradingId
            }
        })
        if (res && res.length && res[0] === 1) {
            return await this.findOrdersByTrading({ tradingId: values.tradingId })
        }
        return false
    }
}

module.exports = OrderHistory
