const { DataSource } = require('apollo-datasource')
const { OrderHistory, CompletedTrade } = require('@cats/helper-mariadb')

class OrderHistoryApi extends DataSource {
    constructor (store) {
        super()
    }

    initialize (config) {
        this.context = config.context
    }

    async findOrdersBySymbol ({ symbol }) {
        const res = await OrderHistory.findAll({
            where: {
                symbol
            },
            include: PositionStatus
        })
        return res && res.length ? res: false
    }

    async findOrdersByTrading ({ tradingId }) {
        const res = await OrderHistory.findAll({
            where: {
                tradingId
            },
            include: CompletedTrade
        })
        return res && res.length ? res: false
    }

    async findOrder ({ orderId }) {
        const res = await OrderHistory.findOne({
            where: {
                orderId
            }
        })
        return res || false
    }

    async updateOrder ({ values }) {
        const res = await OrderHistory.upsert(values, {
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

module.exports = OrderHistoryApi
