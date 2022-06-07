const { Influx2 } = require('@cats/helper-influx2')
const { sequelize, OpenPosition, PositionStatus, CompletedTrade, OrderHistory } = require('@cats/helper-mariadb')

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
