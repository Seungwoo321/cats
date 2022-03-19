const { Influx2 } = require('../lib/influx2')
const { sequelize, OpenPosition, PositionStatus } = require('../lib/mariadb')

const createStore = () => {
    console.log(sequelize)
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
