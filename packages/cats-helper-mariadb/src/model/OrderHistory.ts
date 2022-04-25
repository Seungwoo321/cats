import { sequelize, options, DataTypes } from '../util'

export const OrderHistory = sequelize.define('OrderHistory', {
    orderId: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    tradingId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    lastQty: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    orderQty: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    leavesQty: {
        type: DataTypes.INTEGER,
        allowNull: true
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
        type: DataTypes.STRING(5),
        allowNull: true
    },
    ordType: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ordStatus: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING(5),
        allowNull: true
    },
    homeNotional: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    text: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, options)