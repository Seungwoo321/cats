const { DataSource } = require('apollo-datasource')
const { CompletedTrade } = require('@cats/helper-mariadb')
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
            },
            include: PositionStatus
        })
        return res && res.length ? res: false
    }

    async findOrdersByTrading ({ tradingId }) {
        const res = await this.store.findAll({
            where: {
                tradingId
            },
            include: CompletedTrade
        })
        console.log(res)
        return res && res.length ? res: false
    }

    async findOrder ({ orderId }) {
        const res = await this.store.findOne({
            where: {
                orderId
            }
        })
        return res && res.length ? res.get(0) : false
    }

    async updateOrder ({ values }) {
        const res = await this.store.upsert(values, {
            where: {
                orderId: values.orderId
            },
            include: CompletedTrade
        })
        if (res && res.length && res[0] === 1) {
            return await this.findOrder({ orderId: values.orderId })
        }
        return false
    }
}

module.exports = OrderHistory
