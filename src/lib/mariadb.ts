import { Sequelize, DataTypes, Model } from 'sequelize'
import { MARIADB_HOST, MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD } from '../config'

const sequelize = new Sequelize(MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, {
    host: MARIADB_HOST,
    dialect: 'mariadb'
})

class OpenPosition extends Model { }
OpenPosition.init({
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direction: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entryTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    entryPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    growth: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    profit: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    profitPct: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    holdingPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    initialStopPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    curStopPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    profitTarget: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    initialUnitRisk: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    initialRiskPct: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    curRiskPct: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    curRMultiple: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: 'bitmex',
    modelName: 'open_position',
    underscored: true
})
class PositionStatus extends Model { }
PositionStatus.init({
    symbol: {
        type: DataTypes.STRING
    },
    direction: {
        type: DataTypes.STRING
    },
    conditionalEntryPrice: {
        type: DataTypes.DECIMAL
    },
    value: {
        type: DataTypes.STRING
    }
}, {
    sequelize: sequelize,
    schema: 'bitmex',
    modelName: 'position_status',
    underscored: true
})

export {
    sequelize,
    OpenPosition,
    PositionStatus
}
