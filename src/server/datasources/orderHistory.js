const { DataSource } = require('apollo-datasource')
const { Op } = require('sequelize')
class OrderHistory extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async orderHistory ({ symbol }) {
        const res = await this.store.findAll({
            where: {
                [Op.eq]: {
                    symbol
                }
            }
        })
        return res
    }

    async findOrderByTradingId ({ tradingId }) {
        const res = await this.store.findAll({
            where: {
                [Op.eq]: {
                    tradingId
                }
            }
        })
        return res
    }

    async updateOrder ({ values }) {
        const res = await this.store.upsert(values, {
            where: {
                [Op.eq]: {
                    tradingId: values.tradingId
                }
            }
        })
        if (res && res.length && res[0] === 1) {
            return await this.findOrderByTradingId({ tradingId: values.tradingId })
        }
        return false
    }
}

module.exports = OrderHistory
