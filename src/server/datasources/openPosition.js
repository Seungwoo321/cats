const { DataSource } = require('apollo-datasource')

class OpenPosition extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async createOpenPosition (position) {
        const res = await this.store.findOrCreate({
            where: {
                symbol: position.symbol
            },
            defaults: position
        })
        return res && res.length ? res[0].get() : false
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
        const res = await this.store.findAll({
            where: { symbol }
        })
        return res && res.length ? res[0].get() : false
    }

    async updatePosition ({ values }) {
        const res = await this.store.update(values, {
            where: { symbol: values.symbol }
        })
        if (res && res.length && res[0] === 1) {
            return this.getPosition({ symbol: values.symbol })
        }
    }

    async closePostion ({ symbol }) {
        return await this.store.destroy({ where: { symbol } })
    }
}

module.exports = OpenPosition
