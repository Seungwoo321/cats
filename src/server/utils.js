const { Influx2 } = require('@lib/influx2')
const { sequelize, OpenPosition, PositionStatus, CompletedTrade } = require('@lib/mariadb')

const createStore = () => {
    return {
        mariadb: {
            sequelize,
            OpenPosition,
            PositionStatus,
            CompletedTrade
        },
        influx2: new Influx2()
    }
}
module.exports = {
    createStore
}
