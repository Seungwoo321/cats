import { CompletedTrade } from './model/CompletedTrade'
import { OpenPosition } from './model/OpenPosition'
import { OrderHistory } from './model/OrderHistory'
import { PositionStatus } from './model/PositionStatus'
import { sequelize } from './util'

(async () => {
    /** PositionStatus (1) : CompletedTrade (N) */
    PositionStatus.hasMany(CompletedTrade, {
        foreignKey: 'symbol'
    })
    CompletedTrade.belongsTo(PositionStatus)

    /** PositionStatus (1) : OpenPosition (1) */
    PositionStatus.hasOne(OpenPosition, {
        foreignKey: 'symbol'
    })
    OpenPosition.belongsTo(PositionStatus)

    /** CompletedTrade (1) : OrderHistory (N) */
    CompletedTrade.hasMany(OrderHistory, {
        foreignKey: 'trading_id'
    })
    OrderHistory.belongsTo(CompletedTrade)
    await sequelize.sync({ force: !!process.env.TEST });
})();

export {
    sequelize,
    OpenPosition,
    PositionStatus,
    CompletedTrade,
    OrderHistory
}
