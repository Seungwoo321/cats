import { ITrade, OrderText, OrderStatus, IOrder } from '@lib/exchange'
import { service as gqlService } from '@lib/gql'
import { TradeDirection } from '@lib/grademark'
/**
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    direction: {
        type: DataTypes.STRING,
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
    exitTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    exitPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    profit: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    profitPct: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    holdingPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    exitReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stopPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    size: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    orderId: {
        type: DataTypes.STRING,
        primaryKey: true
    }
 */

async function record (symbol: string, data: IOrder) {
    const positionStatus = await gqlService.getPositionStatus(symbol)
    const tradingId = positionStatus.tradingId
    // const currentTrading = await gqlService.completedTrading(tradingId)
    const order = {
        ...data,
        tradingId,
        symbol
    } as IOrder
    switch (data.ordStatus) {
    case OrderStatus.New:

        gqlService.updateOrder(order)

        break
    case OrderStatus.Filled:
        gqlService.updateOrder(order)
        break
    case OrderStatus.PartiallyFilled:
        gqlService.updateOrder(order)
        break
    case OrderStatus.Canceled:
        gqlService.updateOrder(order)
        break
    default:
        break
    }
    // if (data.text === OrderText.EntryRule) {
    //     const trade = {
    //         tradingId,
    //         symbol,
    //         direction: data.side === 'Buy' ? TradeDirection.Long : TradeDirection.Short,
    //         entryTime: data.timestamp,
    //         entryPrice: data.avgPx,
    //         size: data.orderQty - data.leavesQty
    //     } as ITrade
    //     gqlService.updateTrade(trade)
    // } else {
    //     const exitPrice = data.avgPx
    //     const trade = {
    //         exitTime: data.timestamp,
    //         exitPrice: data.avgPx,
    //         exitReason: data.text,
    //         profit: currentTrading.direction === TradeDirection.Long
    //             ? exitPrice - currentTrading.entryPrice
    //             : currentTrading.entryPrice - exitPrice
    //     } as ITrade
    //     gqlService.updateTrade(trade)
    // }
}

export {
    record
}
