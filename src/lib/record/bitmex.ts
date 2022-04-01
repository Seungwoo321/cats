import { ITrade, OrderText, OrderStatus, IOrder } from '@lib/exchange'
import { service as gqlService } from '@lib/gql'
import { TradeDirection } from '@lib/grademark'

async function record (symbol: string, data: IOrder) {
    const positionStatus = await gqlService.getPositionStatus(symbol)
    if (!positionStatus.tradingId) {
        throw new Error('Expect tradingId must exist')
    }
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
            await gqlService.updateTrading(trade)
        }
        return Promise.resolve()
    }

    async function closeTrading (data: IOrder) {
        if (data.text === OrderText.EntryRule) {
            const trade = {
                ...currentTrading,
                entryPrice: data.avgPrice,
                qty: data.orderQty - data.leavesQty
            }
            await gqlService.updateTrading(trade)
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
            await gqlService.updateTrading(trade)
        }
        return Promise.resolve()
    }

    async function cancelTrading () {
        await gqlService.removeTrading(tradingId)
        return Promise.resolve()
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
        await cancelTrading()

        break
    default:
        break
    }
}

export {
    record
}
