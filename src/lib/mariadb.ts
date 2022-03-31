import { Sequelize, DataTypes, Model } from 'sequelize'
import { MARIADB_HOST, MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, EXCHANGE_ID } from '@config'

const sequelize = new Sequelize(MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, {
    host: MARIADB_HOST,
    dialect: 'mariadb'
})

class OpenPosition extends Model {}
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
        type: DataTypes.FLOAT,
        allowNull: false
    },
    growth: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    profit: {
        type: DataTypes.FLOAT,
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
        type: DataTypes.FLOAT,
        allowNull: false
    },
    curStopPrice: {
        type: DataTypes.FLOAT,
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

class PositionStatus extends Model {}
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
        type: DataTypes.FLOAT,
        allowNull: true
    },
    tradingId: {
        type: DataTypes.STRING,
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
        allowNull: false
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
        type: DataTypes.FLOAT,
        allowNull: false
    },
    exitTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    exitPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    profit: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    profitPct: {
        type: DataTypes.FLOAT,
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
        type: DataTypes.FLOAT,
        allowNull: true
    },
    qty: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    tradingId: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    sequelize: sequelize,
    schema: EXCHANGE_ID,
    modelName: 'completed_trade',
    underscored: true
})

class OrderHistory extends Model {}

OrderHistory.init({
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastQty: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ordQty: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    leavesQty: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lastPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    ordPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    avgPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    stopPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    side: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ordType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ordStatus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    homeNotional: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    orderId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    tradingId: {
        type: DataTypes.STRING
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
    PositionStatus,
    CompletedTrade,
    OrderHistory
}
