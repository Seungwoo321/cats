const { Influx2 } = require('@lib/influx2')
const { sequelize, OpenPosition, PositionStatus, CompletedTrade, OrderHistory } = require('@lib/mariadb')

const createStore = () => {
    return {
        mariadb: {
            sequelize,
            OpenPosition,
            PositionStatus,
            CompletedTrade,
            OrderHistory
        },
        influx2: new Influx2()
    }
}
module.exports = {
    createStore
}
