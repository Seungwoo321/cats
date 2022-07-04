const { DataSource } = require('apollo-datasource')
const { OpenPosition, PositionStatus } = require('@cats/helper-mariadb')

class OpenPositionApi extends DataSource {
    constructor () {
        super()
    }

    initialize (config) {
        this.context = config.context
    }

    async createPosition (position) {
        const res = await OpenPosition.findOrCreate({
            where: {
                symbol: position.symbol
            },
            defaults: position,
            include: PositionStatus
        })
        if (res && res.length && res[0] === 1) {
            return this.getPosition({ symbol: position.symbol })
        }
    }

    async getPositions ({ symbols }) {
        const results = []
        for (const symbol of symbols) {
            const res = await this.getPosition({ symbol })
            if (res) results.puhs(res)
        }
        return results
    }

    async getPosition ({ symbol }) {
        const res = await OpenPosition.findOne({
            where: {
                symbol: symbol
            },
            include: PositionStatus
        })
        return res || false
    }

    async updatePosition ({ values }) {
        const res = await OpenPosition.upsert(values, {
            where: {
                symbol: values.symbol
            },
            include: PositionStatus
        })
        if (res && res.length && res[0] === 1) {
            return this.getPosition({ symbol: values.symbol })
        }
    }

    async closePostion ({ symbol }) {
        const res = await OpenPosition.destroy({
            where: {
                symbol
            },
            include: PositionStatus
        })
        if (res > 0) {
            return this.getPosition({ symbol })
        }
    }
}

module.exports = OpenPositionApi
