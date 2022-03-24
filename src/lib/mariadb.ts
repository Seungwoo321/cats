import { Sequelize, DataTypes, Model } from 'sequelize'
import { MARIADB_HOST, MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, EXCHANGE_ID } from '@config'

const sequelize = new Sequelize(MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, {
    host: MARIADB_HOST,
    dialect: 'mariadb'
})

class OpenPosition extends Model { }
OpenPosition.init({
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: DataTypes.STRING,
        allowNull: false
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
        allowNull: true
    },
    profitPct: {
        type: DataTypes.DOUBLE,
        allowNull: true
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
        allowNull: true
    },
    profitTarget: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: EXCHANGE_ID,
    modelName: 'open_position',
    underscored: true
})

class PositionStatus extends Model { }
PositionStatus.init({
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: DataTypes.STRING,
        allowNull: false
    },
    conditionalEntryPrice: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: EXCHANGE_ID,
    modelName: 'position_status',
    underscored: true
})

class CompletedTrade extends Model {}

CompletedTrade.init({
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entryTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    entryPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    exitTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    exitPrice: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    profit: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    profitPct: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    holdingPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    exitReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stopPrice: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    size: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    orderId: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    sequelize: sequelize,
    schema: EXCHANGE_ID,
    modelName: 'completed_trade',
    underscored: true
})

class OrderHistory extends Model { }

OrderHistory.init({
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    size: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    Filled: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    stopPrice: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fillPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    time: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: sequelize,
    schema: EXCHANGE_ID,
    modelName: 'order_history',
    underscored: true
})

PositionStatus.belongsTo(OpenPosition)
sequelize.sync()

export {
    sequelize,
    OpenPosition,
    PositionStatus
}
