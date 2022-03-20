const { Influx2 } = require('../../dist/lib/influx2')
const { sequelize, OpenPosition, PositionStatus } = require('../../dist/lib/mariadb')

const createStore = () => {
    return {
        mariadb: {
            sequelize,
            OpenPosition,
            PositionStatus
        },
        influx2: new Influx2()
    }
}
module.exports = {
    createStore
}
