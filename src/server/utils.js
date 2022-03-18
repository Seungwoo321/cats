const { Influx2 } = require('../lib/influx2')
const { sequelize, OpenPosition, PositionStatus } = require('../lib/mariadb')

export const createStore = () => {
    return {
        mariadb: {
            sequelize,
            OpenPosition,
            PositionStatus
        },
        influx2: new Influx2()
    }
}
