const { DataSource } = require('apollo-datasource')
const { PositionStatus } = require('@cats/helper-mariadb')
class CompletedTrade extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async findTrading ({ tradingId }) {
        const res = await this.store.findOne({
            where: {
                tradingId
            }
        })
        return res || false
    }

    async findTradingBySymbol ({ symbol }) {
        const res = await this.store.findAll({
            where: {
                symbol
            },
            order: [
                ['entryTime', 'DESC']
            ],
            include: PositionStatus
        })
        return res && res.length ? res : false
    }

    async updateTrading ({ values }) {
        const res = await this.store.upsert(values, {
            where: {
                tradingId: values.tradingId
            }
        })
        if (res && res.length && res[0] === 1) {
            return await this.findTrading({ tradingId: values.tradingId })
        }
        return false
    }

    async removeTrading ({ tradingId }) {
        return await this.store.destroy({ where: { tradingId } })
    }
}

module.exports = CompletedTrade
