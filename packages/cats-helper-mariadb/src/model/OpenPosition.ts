import { sequelize, options, DataTypes } from '../util'

export const OpenPosition = sequelize.define('open_position', {
    positionId: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    // symbol: {
    //     type: DataTypes.STRING(50),
    //     unique: true,
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
        allowNull: false
    },
    initialStopPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    curStopPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    profitTarget: {
        type: DataTypes.DOUBLE,
        allowNull: true
    }
}, options)
