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
    const currentTrading = await gqlService.completedTrading(tradingId) as ITrade
    const order = {
        ...data,
        tradingId,
        symbol
    } as IOrder

    async function openTrading (data: IOrder) {
        if (data.text === OrderText.EntryRule) {
            const trade = {
                tradingId,
                symbol,
                direction: data.side === 'Buy' ? TradeDirection.Long : TradeDirection.Short,
                entryTime: data.time,
                entryPrice: data.avgPrice,
                qty: data.orderQty - data.leavesQty
            }
            await gqlService.updateTrade(trade)
        }
    }

    async function closeTrading (data: IOrder) {
        if (data.text === OrderText.EntryRule) {
            const trade = {
                ...currentTrading,
                entryPrice: data.avgPrice,
                qty: data.orderQty - data.leavesQty
            }
            gqlService.updateTrade(trade)
        }

        if (data.text === OrderText.ExitRule && currentTrading !== null) {
            const profit = currentTrading.direction === TradeDirection.Long
                ? data.avgPrice - currentTrading.entryPrice
                : currentTrading.entryPrice - data.avgPrice
            const trade = {
                ...currentTrading,
                exitTime: data.time,
                exitPrice: data.avgPrice,
                profit,
                profitPct: (profit / currentTrading.entryPrice) * 100,
                exitReason: data.text

            }
            gqlService.updateTrade(trade)
        }
    }

    async function removeTrading (data: IOrder) {
        //
    }

    switch (data.ordStatus) {
    case OrderStatus.New:

        await gqlService.updateOrder(order)
        await openTrading(data)

        break
    case OrderStatus.Filled:

        await gqlService.updateOrder(order)
        await closeTrading(data)

        break
    case OrderStatus.PartiallyFilled:

        await gqlService.updateOrder(order)
        await closeTrading(data)

        break
    case OrderStatus.Canceled:

        await gqlService.updateOrder(order)
        await removeTrading(data)

        break
    default:
        break
    }
}

export {
    record
}
