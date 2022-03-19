"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionStatus = exports.OpenPosition = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
const sequelize = new sequelize_1.Sequelize(config_1.MARIADB_DATABASE, config_1.MARIADB_USERNAME, config_1.MARIADB_PASSWORD, {
    host: config_1.MARIADB_HOST,
    dialect: 'mariadb'
});
exports.sequelize = sequelize;
class OpenPosition extends sequelize_1.Model {
}
exports.OpenPosition = OpenPosition;
OpenPosition.init({
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    direction: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    entryTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    entryPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    growth: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    profit: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    profitPct: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    },
    holdingPeriod: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    initialStopPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    curStopPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    profitTarget: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    },
    initialUnitRisk: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    initialRiskPct: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    },
    curRiskPct: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    },
    curRMultiple: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: config_1.EXCHANGE_ID,
    modelName: 'open_position',
    underscored: true
});
OpenPosition.sync();
class PositionStatus extends sequelize_1.Model {
}
exports.PositionStatus = PositionStatus;
PositionStatus.init({
    symbol: {
        type: sequelize_1.DataTypes.STRING
    },
    direction: {
        type: sequelize_1.DataTypes.STRING
    },
    conditionalEntryPrice: {
        type: sequelize_1.DataTypes.DECIMAL
    },
    value: {
        type: sequelize_1.DataTypes.STRING
    }
}, {
    sequelize: sequelize,
    schema: config_1.EXCHANGE_ID,
    modelName: 'position_status',
    underscored: true
});
PositionStatus.sync();
