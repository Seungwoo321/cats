import { IStrategy, IPosition, IBar, TradeDirection, PositionStatus, IEnterPositionOptions, ITrade, IOrder, OrderStatus, IPositionStatus, OrderText } from '@cats/types'
import { Position } from '@cats/types'
import { exchange } from '@cats/helper-exchange'
import { service as gqlService } from '@cats/helper-gql'
import { IDataFrame } from 'data-forge'
import { Market } from 'ccxt'
import { assert } from 'chai'
import { v4 as uuidv4 } from 'uuid'

const { debug } = require('@cats/shared-utils')
const logger = debug('trading:bitmex')

/**
 * Update an open position for a new bar.
 *
 * @param position The position to update.
 * @param bar The current bar.
 * @returns
 */
async function updatePosition (position: IPosition, bar: IBar, amount: number, flagNewTrailingStop: boolean): Promise<IPosition> {
    position.profit = bar.close - position.entryPrice
    position.profitPct = (position.profit / position.entryPrice) * 100
    position.growth = position.direction === TradeDirection.Long
        ? bar.close / position.entryPrice
        : position.entryPrice / bar.close

    position.holdingPeriod += 1
    if (flagNewTrailingStop && typeof position.curStopPrice === 'number') {
        const symbol: string = position.symbol
        await exchange.createOrder(
            symbol,
            'stopLimit',
            position.direction === TradeDirection.Long ? 'sell' : 'buy',
            amount,
            position.curStopPrice,
            {
                stopPrice: position.curStopPrice,
                text: 'trailing-stop',
                execInst: 'LastPrice,Close'
            }
        )
    }

    return await gqlService.updatePosition(position)
}

/**
 *
 * @param symbol
 * @param bar
 */
async function trading<InputBarT extends IBar, IndicatorBarT extends InputBarT, ParametersT, IndexT> (
    symbol: string,
    strategy: IStrategy<InputBarT, IndicatorBarT, ParametersT, IndexT>,
    inputSeries: IDataFrame<IndexT, InputBarT>
): Promise<void> {
    logger('trading:start')
    if (inputSeries.none()) {
        throw new Error('Expect input data series to contain at last 1 bar.')
    }

    const lookbackPeriod = strategy.lookbackPeriod || 1
    if (inputSeries.count() < lookbackPeriod) {
        throw new Error('You have less input data than your lookback period, the size of your input data should be some multiple of your lookback period.')
    }
    const markets = await exchange.loadMarkets()
    const strategyParameters = strategy.parameters || {} as ParametersT
    let openPosition = await gqlService.getOpenPosition(symbol)
    let newTrailingStopOrder = false
    let indicatorsSeries: IDataFrame<IndexT, IndicatorBarT>

    // Prepare indicators.
    if (strategy.prepIndicators) {
        indicatorsSeries = strategy.prepIndicators({
            parameters: strategyParameters,
            inputSeries: inputSeries
        })
    } else {
        indicatorsSeries = inputSeries as IDataFrame<IndexT, IndicatorBarT>
    }
    const bar = indicatorsSeries.last()
    const positionStatus = await gqlService.getPositionStatus(symbol)
    const entryPrice = bar.close
    const positionDirection = positionStatus.direction
    const positions: Position[] = await exchange.fetchPositions()
    const currentPosition: Position = positions.find(position => position.symbol === symbol.split(':')[0].replace('/', '')) || {
        isOpen: false,
        currentQty: '0'
    }
    const capital = positionStatus.startingCapital
    /**
     *
     * @param openPosition
     * @param symbol
     */
    async function createPosition(openPosition: IPosition, symbol: string) {
        const market: Market = markets[symbol]
        logger('trading:createPosition')
        logger('capital: ' + capital)
        // const balance = await exchange.fetchBalance()
        // let availableMargin: number = balance.BTC.total * 100000000 * (1 - +market.info.initMargin - +market.info.maintMargin)
        let availableMargin: number = capital / 100000000 * (1 - +market.info.initMargin - +market.info.maintMargin)
        if (market.maker) {
            availableMargin += market?.maker
        }
        const amount: number = symbol === 'BTC/USD:BTC'
            ? availableMargin * openPosition.entryPrice
            : availableMargin / market.info.multiplier / openPosition.entryPrice * market.info.lotSize
        const formattedAmount: number = parseFloat(exchange.amountToPrecision(symbol, amount))
        openPosition.amount = formattedAmount

        const formattedPrice: number = parseFloat(exchange.priceToPrecision(symbol, openPosition.entryPrice))
        // cancle all orders
        const cancles = await exchange.cancelAllOrders(symbol) as any[]
        const cancleIds = cancles.map(order => order.id)
        if (cancleIds.length) {
            logger('Cancle order: ' + cancleIds.join(', '))
        } else {
            logger('No cancle order')
        }
        logger('formattedAmount: ' + formattedAmount)
        logger('formattedPrice: ' + formattedPrice)
        // create new order
        const order = await exchange.createOrder(
            symbol,
            'limit',
            openPosition.direction === TradeDirection.Long ? 'buy' : 'sell',
            formattedAmount,
            formattedPrice,
            {
                displayQty: 0,
                text: 'entry-rule'
            }
        )
        logger(order.datetime, order.id)
        // if initial stop price then add stop order
        if (openPosition.initialStopPrice) {
            const order = await exchange.createOrder(
                symbol,
                'stop',
                openPosition.direction === TradeDirection.Long ? 'sell' : 'buy',
                formattedAmount,
                openPosition.initialStopPrice,
                {
                    stopPx: openPosition.initialStopPrice,
                    text: 'stop-loss',
                    execInst: 'LastPrice,Close'
                }
            )
            logger(order.datetime, order.id)
        }

        // if trailing stop loss then add trailing stop order
        if (strategy.trailingStopLoss && openPosition.curStopPrice !== undefined && openPosition.initialStopPrice !== openPosition.curStopPrice) {
            const order = await exchange.createOrder(
                symbol,
                'stopLimit',
                openPosition.direction === TradeDirection.Long ? 'sell' : 'buy',
                formattedAmount,
                openPosition.curStopPrice,
                {
                    ordType: 'stopLimit',
                    stopPx: openPosition.curStopPrice,
                    text: 'trailing-stop',
                    execInst: 'LastPrice,Close'

                }
            )
            logger(order.datetime, order.id)
        }
    }
    /**
     *
     * @param direction
     * @param symbol
     * @param amount
     * @param exitPrice
     * @param exitReason
     * @returns
     */
    async function closePosition (
        direction: TradeDirection,
        symbol: string,
        amount: number,
        exitPrice: number,
        exitReason: string
    ) {
        logger('trading:closePosition')
        return await exchange.createOrder(
            symbol,
            'limit',
            direction === TradeDirection.Long ? 'sell' : 'buy',
            amount,
            exitPrice,
            {
                displayQty: 0,
                text: exitReason,
                execInst: 'ReduceOnly'
            }
        )
    }
    /**
     *
     * @param options
     */
    async function enterPosition (options?: IEnterPositionOptions) {
        assert(positionStatus.value === PositionStatus.None, 'Can only enter a position when not already in one.')
        if (options?.symbol && options?.direction && options?.entryPrice) {
            logger('trading:enterPosition (updatePositionStatusEnter)')
            await gqlService.updatePositionStatusEnter(symbol, options.direction, options.entryPrice)
        }
    }
    /**
     *
     * @param symbol
     * @returns
     */
    async function exitPosition (symbol: string) {
        assert(positionStatus.value === PositionStatus.Position, 'Can only exit a position when we are in a position.')
        logger('trading:exitPosition (updatePositionStatusExit)')
        return await gqlService.updatePositionStatusExit(symbol)
    }

    switch (positionStatus.value) {
    case PositionStatus.None:
        logger(`trading:${positionStatus.value}~`)
        await strategy.entryRule(enterPosition, {
            bar,
            parameters: {
                ...strategyParameters,
                symbol,
                entryPrice
            }
        })
        break

    case PositionStatus.Enter:
        logger(`trading:${positionStatus.value}~`)
        assert(openPosition === null, 'Expected there to be no open position initialised yet!')
        if (positionStatus.conditionalEntryPrice !== undefined) {
            if (positionStatus.direction === TradeDirection.Long) {
                if (bar.high < positionStatus.conditionalEntryPrice) {
                    await exchange.cancelAllOrders(symbol)
                    if (positionStatus.tradingId) {
                        await gqlService.removeTrading(positionStatus.tradingId)
                    }
                    await gqlService.updatePositionStatusNone(symbol)
                    break
                }
            } else {
                if (bar.low > positionStatus.conditionalEntryPrice) {
                    await exchange.cancelAllOrders(symbol)
                    if (positionStatus.tradingId) {
                        await gqlService.removeTrading(positionStatus.tradingId)
                    }
                    await gqlService.updatePositionStatusNone(symbol)
                    break
                }
            }
        }
        openPosition = {
            symbol,
            direction: positionDirection,
            entryTime: new Date(bar.time),
            entryPrice,
            growth: 1,
            profit: 0,
            profitPct: 0,
            holdingPeriod: 0,
            amount: 0
        }

        if (strategy.stopLoss) {
            const initialStopDistance = strategy.stopLoss({
                entryPrice,
                position: openPosition,
                bar,
                parameters: strategyParameters
            })
            openPosition.initialStopPrice = openPosition.direction === TradeDirection.Long
                ? entryPrice - initialStopDistance
                : entryPrice + initialStopDistance
            openPosition.curStopPrice = parseFloat(exchange.priceToPrecision(symbol, openPosition.initialStopPrice))
            openPosition.initialStopPrice = parseFloat(exchange.priceToPrecision(symbol, openPosition.initialStopPrice))
        }

        if (strategy.trailingStopLoss) {
            const trailingStopDistance = strategy.trailingStopLoss({
                entryPrice,
                position: openPosition,
                bar,
                parameters: strategyParameters
            })

            const trailingStopPrice = openPosition.direction === TradeDirection.Long
                ? entryPrice - trailingStopDistance
                : entryPrice + trailingStopDistance
            if (openPosition.initialStopPrice === undefined) {
                openPosition.initialStopPrice = trailingStopPrice
            } else {
                openPosition.initialStopPrice = openPosition.direction === TradeDirection.Long
                    ? Math.max(openPosition.initialStopPrice, trailingStopPrice)
                    : Math.min(openPosition.initialStopPrice, trailingStopPrice)
            }
            openPosition.curStopPrice = parseFloat(exchange.priceToPrecision(symbol, openPosition.initialStopPrice))
            openPosition.initialStopPrice = parseFloat(exchange.priceToPrecision(symbol, openPosition.initialStopPrice))
        }

        if (strategy.profitTarget) {
            const profitDistance = strategy.profitTarget({
                entryPrice,
                position: openPosition,
                bar,
                parameters: strategyParameters
            })
            openPosition.profitTarget = openPosition.direction === TradeDirection.Long
                ? entryPrice + profitDistance
                : entryPrice - profitDistance
            openPosition.profitTarget = parseFloat(exchange.priceToPrecision(symbol, openPosition.profitTarget))
        }

        await createPosition(openPosition, symbol)

        break
    case PositionStatus.Position:
        logger(`trading:${positionStatus.value}~`)
        assert(openPosition !== null, 'Expected open position to already be initialised!')

        if (!currentPosition.isOpen) {
            await exchange.cancelAllOrders(symbol)
            if (positionStatus.tradingId) {
                await gqlService.removeTrading(positionStatus.tradingId)
            }
            await gqlService.updatePositionStatusNone(symbol)
            await gqlService.closePosition(symbol)
            break
        }

        if (+currentPosition.currentQty !== 0 && openPosition?.curStopPrice) {
            if (openPosition.direction === TradeDirection.Long) {
                if (bar.close <= openPosition.curStopPrice) {
                    await exitPosition(symbol)
                    await closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'stop-loss')

                    break
                }
            } else if (openPosition.direction === TradeDirection.Short) {
                if (bar.close >= openPosition.curStopPrice) {
                    await exitPosition(symbol)
                    await closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'stop-loss')

                }
            }
        }

        if (+currentPosition.currentQty !== 0 && openPosition?.profitTarget) {
            if (openPosition.direction === TradeDirection.Long) {
                if (bar.high >= openPosition.profitTarget) {
                    await exitPosition(symbol)
                    await closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), openPosition.profitTarget, 'profit-target')
                    break
                }
            } else {
                if (bar.low <= openPosition.profitTarget) {
                    await exitPosition(symbol)
                    await closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), openPosition.profitTarget, 'profit-target')
                    break
                }
            }
        }

        if (strategy.trailingStopLoss) {
            const trailingStopDistance = strategy.trailingStopLoss({
                entryPrice: openPosition!.entryPrice,
                position: openPosition!,
                bar,
                parameters: strategyParameters
            })
            if (openPosition!.direction === TradeDirection.Long) {
                const newTrailingStopPrice = bar.close - trailingStopDistance
                if (newTrailingStopPrice > openPosition!.curStopPrice!) {
                    openPosition!.curStopPrice = newTrailingStopPrice
                    newTrailingStopOrder = true
                }
            } else {
                const newTrailingStopPrice = bar.close + trailingStopDistance
                if (newTrailingStopPrice < openPosition!.curStopPrice!) {
                    openPosition!.curStopPrice = newTrailingStopPrice
                    newTrailingStopOrder = true
                }
            }
            openPosition!.curStopPrice = parseFloat(exchange.priceToPrecision(symbol, openPosition!.curStopPrice))
        }
        if (+currentPosition.currentQty !== 0) {
            await updatePosition(openPosition!, bar, Math.abs(+currentPosition.currentQty), newTrailingStopOrder)
        }

        if (strategy.exitRule) {
            await strategy.exitRule(exitPosition, {
                entryPrice: openPosition!.entryPrice,
                position: openPosition!,
                bar: bar,
                parameters: {
                    ...strategyParameters,
                    symbol,
                    entryPrice: openPosition!.entryPrice
                }
            })
        }
        break

    case PositionStatus.Exit:
        logger(`trading:${positionStatus.value}~`)
        assert(openPosition !== null, 'Expected open position to already be initialised!')
        if (+currentPosition.currentQty !== 0) {
            await closePosition(openPosition!.direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'exit-rule')
        } else {
            await gqlService.closePosition(symbol)
            await gqlService.updatePositionStatusNone(symbol)
        }
        break

    default:
        throw new Error('Unexpected state! from trading')
    }
    logger('trading:end ')
    return Promise.resolve()
}

async function executionTrading(
    symbol: string,
    data: IOrder,
    execInst: string
): Promise<void> {
    logger('executionTrading:start')
    const positionStatus = await gqlService.getPositionStatus(symbol)
    
    if (positionStatus.value === PositionStatus.None) {
        throw new Error('Expect status is not None')
    }
    if (!positionStatus.tradingId) {
        throw new Error('Expect status is must exist')
    }
    if (data.ordType === 'Funding' || execInst === 'Funding') {
        console.log('!!!!!')
        console.log(data.ordType)
        console.log(data)
        console.log('!!!!!')
        return Promise.resolve()
    }

    function openPositionToInitialize(
        tradingId: string,
        positionStatus: IPositionStatus,
        order: IOrder
    ): IPosition {
        return {
            positionId: tradingId,
            symbol,
            direction: positionStatus.direction,
            entryTime: new Date(order.time),
            entryPrice: order.avgPrice,
            growth: 1,
            profit: 0,
            profitPct: 0,
            holdingPeriod: 0,
            amount: Number(order.orderQty)
        } 
    }
    function tradingToInitialize(
        tradingId: string,
        openPosition: IPosition
    ): ITrade {
        return {
            tradingId,
            symbol: openPosition.symbol,
            direction: openPosition.direction,
            entryTime: openPosition.entryTime,
            entryPrice: openPosition.entryPrice,
            holdingPeriod: openPosition.holdingPeriod,
        }
    }
    function tradingToComplete(
        trade: ITrade,
        data: IOrder,
        openPosition: IPosition,
        positionStatus: IPositionStatus
    ): ITrade {
        trade.growth = openPosition.direction === TradeDirection.Long
            ? data.avgPrice / openPosition.entryPrice
            : openPosition.entryPrice / data.avgPrice
        trade.profit = data.avgPrice - openPosition.entryPrice
        trade.profitPct = (trade.profit / openPosition.entryPrice) * 100
        trade.amount = data.orderQty
        trade.exitTime = data.time
        trade.exitPrice = data.avgPrice
        trade.exitReason = data.text
        trade.stopPrice = data.stopPrice
        trade.finalCapital = positionStatus.startingCapital * trade.growth
        return trade

    }
    const tradingId = positionStatus.tradingId
    const existTrading = await gqlService.completedTrading(tradingId)
    const order = {
        ...data,
        tradingId
    } as IOrder
    let openPosition = await gqlService.getOpenPosition(symbol) as IPosition
    let isPosition = true

    if (openPosition === null) {
        isPosition = false
        openPosition = openPositionToInitialize(tradingId, positionStatus, data)
    }
    const trading = tradingToInitialize(tradingId, openPosition)
    if (!existTrading.tradingId) {
        logger('executionTrading:createTrading')
        await gqlService.updateTrading(trading)
    }
    await gqlService.updateOrder(order)

    const completedTrading = tradingToComplete(trading, order, openPosition, positionStatus)
    if (execInst === 'Close' && data.ordStatus === OrderStatus.Filled) {
        logger(`executionTrading:${positionStatus.value}~`)

        logger(`executionTrading:updateTradingAndClosePosition (updatePositionStatusNone)`)
        await gqlService.updateTrading(completedTrading)
        await gqlService.closePosition(symbol)
        await gqlService.updatePositionStatusNone(symbol)
        return Promise.resolve()
    }
    switch (positionStatus.value) {
        case PositionStatus.Enter:
            logger(`executionTrading:${positionStatus.value}~ ${OrderStatus.PartiallyFilled}~`)
            if (data.ordStatus === OrderStatus.PartiallyFilled) {
                logger(`executionTrading:updateTrading`)
                await gqlService.updatePosition(openPosition)
            }
            if (data.ordStatus === OrderStatus.Filled) {

                logger(`executionTrading:updatePosition (updatePositionStatusPosition)`)
                await gqlService.updatePosition(openPosition)
                await gqlService.updatePositionStatusPosition(symbol)
            }
        break
        case PositionStatus.Exit:
            logger(`executionTrading:${positionStatus.value}~ ${OrderStatus.PartiallyFilled}~`)
            if (data.ordStatus === OrderStatus.PartiallyFilled) {
                logger(`executionTrading:updateTrading`)
                await gqlService.updatePosition(openPosition)
            }
            if (data.ordStatus === OrderStatus.Filled) {

                logger(`executionTrading:updateTradingAndClosePosition (updatePositionStatusNone)`)
                await gqlService.updateTrading(completedTrading)
                await gqlService.closePosition(symbol)
                await gqlService.updatePositionStatusNone(symbol)
            }
        break
        default:
            logger(`executionTrading:${positionStatus.value}~ ${OrderStatus.PartiallyFilled}~`)
            logger(`Unexpected state`)
        break
    }
    logger('executionTrading:end')
    return Promise.resolve()
}

export {
    trading,
    executionTrading
}
