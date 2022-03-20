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
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
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
        allowNull: true
    },
    profitPct: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true
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
        allowNull: true
    },
    profitTarget: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true
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
class PositionStatus extends sequelize_1.Model {
}
exports.PositionStatus = PositionStatus;
PositionStatus.init({
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    conditionalEntryPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true
    },
    value: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: config_1.EXCHANGE_ID,
    modelName: 'position_status',
    underscored: true
});
class CompletedTrade extends sequelize_1.Model {
}
CompletedTrade.init({
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    entryTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    entryPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    exitTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    exitPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true
    },
    profit: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true
    },
    profitPct: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true
    },
    holdingPeriod: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    exitReason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    stopPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true
    }
}, {
    sequelize: sequelize,
    schema: config_1.EXCHANGE_ID,
    modelName: 'completed_trade',
    underscored: true
});
class OrderHistory extends sequelize_1.Model {
}
OrderHistory.init({
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    size: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    },
    Filled: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true
    },
    stopPrice: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    fillPrice: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    orderId: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true
    },
    time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: sequelize,
    schema: config_1.EXCHANGE_ID,
    modelName: 'oter_history',
    underscored: true
});
PositionStatus.belongsTo(OpenPosition);
sequelize.sync();
