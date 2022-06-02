import { sequelize, options, DataTypes } from '../util'

export const PositionStatus = sequelize.define('position_status', {
    symbol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: 'Long'
    },
    conditionalEntryPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    startingCapital: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'None'
    }
}, options);