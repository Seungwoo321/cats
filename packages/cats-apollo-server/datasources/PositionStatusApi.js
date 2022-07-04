const { DataSource } = require('apollo-datasource')
const { PositionStatus } = require('@cats/helper-mariadb')

class PositionStatusApi extends DataSource {
    constructor () {
        super()
    }

    initialize (config) {
        this.context = config.context
    }

    async positionStatus ({ symbol }) {
        const found = await PositionStatus.findOrCreate({
            where: {
                symbol
            },
            defaults: {
                symbol,
                conditionalEntryPrice: null,
                direction: 'long',
                startingCapital: 0,
                tradingId: null,
                value: 'None'
            }
        })

        return found && found.length ? found[0].get() : false
    }

    async positionStatusUpdate ({ values }) {
        const res = await PositionStatus.update(values, {
            where: { symbol: values.symbol }
        })
        if (res && res.length && res[0] === 1) {
            return this.positionStatus({ symbol: values.symbol })
        }
    }
}

module.exports = PositionStatusApi
