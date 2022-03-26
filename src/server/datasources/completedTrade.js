const { DataSource } = require('apollo-datasource')
const { Op } = require('sequelize')
class CompletedTrade extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async findTradeByOrderId ({ orderId }) {
        const res = await this.store.findAll({
            where: {
                [Op.eq]: {
                    orderId
                }
            }
        })
        return res
    }

    async findTradeBySymbol ({ symbol }) {
        const res = await this.store.findAll({
            where: {
                [Op.eq]: {
                    symbol
                }
            }
        })
        return res
    }

    async updateTrade ({ values }) {
        const res = await this.store.upsert(values, {
            where: {
                [Op.eq]: {
                    orderId: values.orderId
                }
            }
        })
        if (res && res.length && res[0] === 1) {
            return await this.findTradeByOrderId({ orderId: values.orderId })
        }
        return false
    }
}

module.exports = CompletedTrade
