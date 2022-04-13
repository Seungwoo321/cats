"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderHistory = exports.CompletedTrade = exports.PositionStatus = exports.OpenPosition = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const _config_1 = require("@config");
const sequelize = new sequelize_1.Sequelize(_config_1.MARIADB_DATABASE, _config_1.MARIADB_USERNAME, _config_1.MARIADB_PASSWORD, {
    host: _config_1.MARIADB_HOST,
    dialect: 'mariadb',
    dialectOptions: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    }
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
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    growth: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    profit: {
        type: sequelize_1.DataTypes.FLOAT,
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
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    curStopPrice: {
        type: sequelize_1.DataTypes.FLOAT,
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
    schema: _config_1.EXCHANGE_ID,
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
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    tradingId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: _config_1.EXCHANGE_ID,
    modelName: 'position_status',
    underscored: true
});
class CompletedTrade extends sequelize_1.Model {
}
exports.CompletedTrade = CompletedTrade;
CompletedTrade.init({
    tradingId: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true
    },
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
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
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    exitTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    exitPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    profit: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    profitPct: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    exitReason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    stopPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    qty: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false
    },
    holdingPeriod: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    orderId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: sequelize,
    schema: _config_1.EXCHANGE_ID,
    modelName: 'completed_trade',
    underscored: true
});
class OrderHistory extends sequelize_1.Model {
}
exports.OrderHistory = OrderHistory;
OrderHistory.init({
    orderId: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true
    },
    tradingId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    lastQty: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    orderQty: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    leavesQty: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    lastPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    ordPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    avgPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    stopPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    side: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    ordType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    ordStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    homeNotional: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    text: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: sequelize,
    schema: _config_1.EXCHANGE_ID,
    modelName: 'order_history',
    underscored: true
});
PositionStatus.belongsTo(OpenPosition);
sequelize.sync();
