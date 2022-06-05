import { CompletedTrade } from './model/CompletedTrade'
import { OpenPosition } from './model/OpenPosition'
import { OrderHistory } from './model/OrderHistory'
import { PositionStatus } from './model/PositionStatus'
import { sequelize } from './util'

(async () => {
    /** PositionStatus (1) : CompletedTrade (N) */
    PositionStatus.hasMany(CompletedTrade, {
        foreignKey: {
            name: 'symbol',
            allowNull: false
        }
    })
    CompletedTrade.belongsTo(PositionStatus, {
        foreignKey: {
            name: 'symbol',
            allowNull: false
        }
    })
    
    /** PositionStatus (1) : OpenPosition (1) */
    PositionStatus.hasOne(OpenPosition, {
        foreignKey: {
            name: 'symbol',
            allowNull: false
        }
    })
    OpenPosition.belongsTo(PositionStatus, {
        foreignKey: {
            name: 'symbol',
            allowNull: false
        }
    })
    
    /** CompletedTrade (1) : OrderHistory (N) */
    CompletedTrade.hasMany(OrderHistory, {
        foreignKey: {
            name: 'tradingId',
            allowNull: false
        }
    })
    OrderHistory.belongsTo(CompletedTrade, {
        foreignKey: {
            name: 'tradingId',
            allowNull: false
        }
    })
    
    await sequelize.sync({ force: !!process.env.TEST });
})();

export {
    sequelize,
    OpenPosition,
    PositionStatus,
    CompletedTrade,
    OrderHistory
}
