const { DataSource } = require('apollo-datasource')

class PositionStatus extends DataSource {
    constructor (store) {
        super()
        this.store = store
    }

    initialize (config) {
        this.context = config.context
    }

    async positionStatus ({ symbol }) {
        const found = await this.store.findOrCreate({
            where: {
                symbol
            },
            defaults: {
                symbol,
                conditionalEntryPrice: null,
                direction: 'long',
                tradingId: null,
                value: 'None'
            }
        })

        return found && found.length ? found[0].get() : false
    }

    async positionStatusUpdate ({ values }) {
        const res = await this.store.update(values, {
            where: { symbol: values.symbol }
        })
        if (res && res.length && res[0] === 1) {
            return this.positionStatus({ symbol: values.symbol })
        }
    }
}

module.exports = PositionStatus
