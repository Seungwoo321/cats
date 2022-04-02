import { ITrade, OrderText, OrderStatus, IOrder } from '@lib/exchange'
import { service as gqlService } from '@lib/gql'
import { TradeDirection } from '@lib/grademark'

async function record (symbol: string, data: IOrder) {
    const positionStatus = await gqlService.getPositionStatus(symbol)
    if (!positionStatus.tradingId) {
        throw new Error('Expect tradingId must exist')
    }
    const openPosition = await gqlService.getOpenPosition(symbol)
    let holdingPeriod = 0
    if (openPosition?.holdingPeriod) {
        holdingPeriod = openPosition?.holdingPeriod
    }
    const tradingId = positionStatus.tradingId
    const currentTrading = await gqlService.completedTrading(tradingId) as ITrade

    const order = {
        ...data,
        tradingId,
        symbol
    } as IOrder

    async function newTrading (data: IOrder) {
        if (data.text === OrderText.EntryRule) {
            const trade = {
                tradingId,
                symbol,
                orderId: data.orderId,
                direction: data.side === 'Buy' ? TradeDirection.Long : TradeDirection.Short,
                entryTime: data.time,
                entryPrice: data.avgPrice,
                qty: +data.orderQty - +data.leavesQty,
                stopPrice: data.stopPrice,
                holdingPeriod
            }
            await gqlService.updateTrading(trade)
        }
        return Promise.resolve()
    }

    async function filledTrading (data: IOrder) {
        if (data.text === OrderText.EntryRule) {
            const trade = {
                tradingId,
                symbol,
                orderId: data.orderId,
                direction: data.side === 'Buy' ? TradeDirection.Long : TradeDirection.Short,
                entryTime: currentTrading.entryTime || data.time,
                entryPrice: data.avgPrice,
                qty: +data.orderQty - +data.leavesQty,
                stopPrice: data.stopPrice,
                holdingPeriod
            }
            await gqlService.updateTrading(trade)
        } else {
            const profit = currentTrading.direction === TradeDirection.Long
                ? +data.avgPrice - +currentTrading.entryPrice
                : +currentTrading.entryPrice - +data.avgPrice
            const trade = {
                ...currentTrading,
                exitTime: data.time,
                exitPrice: data.avgPrice,
                profit,
                profitPct: (profit / +currentTrading.entryPrice) * 100,
                exitReason: data.text,
                stopPrice: data.stopPrice,
                holdingPeriod

            }
            await gqlService.updateTrading(trade)
        }

        return Promise.resolve()
    }

    switch (data.ordStatus) {
    case OrderStatus.New:

        await gqlService.updateOrder(order)
        await newTrading(data)

        break
    case OrderStatus.Filled:

        await gqlService.updateOrder(order)
        await filledTrading(data)

        break
    case OrderStatus.PartiallyFilled:

        await gqlService.updateOrder(order)
        await filledTrading(data)

        break
    case OrderStatus.Canceled:

        await gqlService.updateOrder(order)
        if (data.orderId === currentTrading.orderId) {
            await gqlService.removeTrading(tradingId)
        }

        break
    default:
        break
    }
}

export {
    record
}
