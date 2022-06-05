import { sequelize, options, DataTypes } from '../util'

export const CompletedTrade = sequelize.define('completed_trade' ,{
    tradingId: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    // symbol: {
    //     type: DataTypes.STRING(50),
    //     allowNull: false
    // },
    direction: {
        type: DataTypes.STRING(5),
        allowNull: false
    },
    entryTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    entryPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    growth: {
        type: DataTypes.DOUBLE,
        allowNull: true
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
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    exitTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    exitPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    exitReason: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    stopPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    finalCapital: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, options)