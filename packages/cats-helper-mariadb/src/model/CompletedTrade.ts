import { sequelize, options, DataTypes } from '../util'

export const CompletedTrade = sequelize.define('CompletedTrade' ,{
    tradingId: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        unique: true,
        allowNull: false,
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
        allowNull: false
    },
    entryPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    growth: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    profit: {
        type: DataTypes.FLOAT,
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
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    exitTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    exitPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    exitReason: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    stopPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    finalCapital: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, options)