const { DataSource } = require('apollo-datasource')
const { PositionStatus, CompletedTrade } = require('@cats/helper-mariadb')

class CompletedTradeApi extends DataSource {

    constructor () {
        super()
    }

    initialize (config) {
        this.context = config.context
    }

    async findTrading ({ tradingId }) {
        const res = await CompletedTrade.findOne({
            where: {
                tradingId
            }
        })
        return res || false
    }

    async findTradingBySymbol ({ symbol }) {
        const res = await CompletedTrade.findAll({
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
        const res = await CompletedTrade.upsert(values, {
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
        return await CompletedTrade.destroy({ where: { tradingId } })
    }
}

module.exports = CompletedTradeApi
