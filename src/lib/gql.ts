import { gql, request } from 'graphql-request'
import { GRAPHQL_URL } from '@config'
import { IBar, IPosition, IPositionStatus, TradeDirection, Timeframe } from '@lib/grademark'
import { ITrade, IOrder } from '@lib/exchange'

const GET_CANDLES: string = gql`
    query Candles ($symbol: String, $timeframe: String) {
        candles (symbol: $symbol, timeframe: $timeframe) {
            time
            open
            high
            low
            close
            volume
        }
    }
`

const GET_POSITION_STATUS: string = gql`
    query PositionStatus ($symbol: String) {
        positionStatus (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            tradingId
            value
        }
    }
`

const GET_OPEN_POSITION: string = gql`
    query Position ($symbol: String) {
        openPosition (symbol: $symbol) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
    }
`
const ENTER_POSITION: string = gql`
    mutation EnterPosition ($symbol: String, $direction: TradeDirection, $entryPrice: Float $tradingId: String) {
        enterPosition (symbol: $symbol, direction: $direction, entryPrice: $entryPrice, tradingId: $tradingId) {
            symbol
            direction
            conditionalEntryPrice
            tradingId
            value
        }
    }
`
const CREATE_POSITION: string = gql`
    mutation CreatePosition ($symbol: String $position: InputPosition) {
        createPosition (symbol: $symbol, position: $position) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
    }
`
const EXIT_POSITION: string = gql`
    mutation ExitPosition ($symbol: String) {
        exitPosition (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            tradingId
            value
        }
    }   
`
const CLOSE_POSITION : string = gql`
    mutation ClosePosition ($symbol: String){
        closePosition (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            tradingId
            value
        }
    }
`
const UPDATE_POSITION: string = gql`
    mutation UpdatePosition ($position: InputPosition) {
        updatePosition (position: $position) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
    }
`

/**
 * Completed Trade
 */
const GET_COMPLETED_TRADES: string = gql`
    query CompletedTrades ($symbol: String) {
        completedTrades (symbol: $symbol) {
            tradingId
            symbol
            direction
            entryTime
            entryPrice
            exitTime
            exitPrice
            profit
            profitPct
            exitReason
            qty
        }
    }
`
const GET_COMPLETED_TRADING: string = gql`
    query CompletedTrading ($tradingId: String) {
        completedTrading (tradingId: $tradingId) {
            tradingId
            symbol
            direction
            entryTime
            entryPrice
            exitTime
            exitPrice
            profit
            profitPct
            exitReason
            qty
        }
    }
`
const UPDATE_COMPLETED_TRADING: string = gql`
    mutation UpdateTrading ($trade: InputTrade) {
        updateTradind (trade: $trade) {
            tradingId
            symbol
            direction
            entryTime
            entryPrice
            exitTime
            exitPrice
            profit
            profitPct
            holdingPeriod
            exitReason
            stopPrice
            qty
        }
    }
`
const REMOVE_COMPLETED_TRADING: string = gql`
    mutation RemoveTrading ($tradingId: String) {
        removeTrading(trading: $trade) {}
    }
`
/**
 * Order History
 */
const GET_ORDER_BY_SYMBOL: string = gql`
    query OrderSymbol ($symbol: String) {
        orderSymbol (symbol: $symbol) {
            symbol
            lastQty
            orderQty
            leavesQty
            lastPrice
            price
            avgPrice
            stopPrice
            side
            ordType
            ordStatus
            currency
            homeNotional
            time
            tradingId
        }
    }
`
const GET_ORDER_BY_TRADING: string = gql`
    query OrderTrading ($tradingId: String) {
        orderTrading (tradingId: $tradingId) {
            symbol
            lastQty
            orderQty
            leavesQty
            lastPrice
            price
            avgPrice
            stopPrice
            side
            ordType
            ordStatus
            currency
            homeNotional
            time
            tradingId
        }
    }
`
const UPDATE_ORDER: string = gql`
    mutation UpdateOrder ($order: InputOrder) {
        updateOrder (order: $order) {
            symbol
            lastQty
            orderQty
            leavesQty
            lastPrice
            price
            avgPrice
            stopPrice
            side
            ordType
            ordStatus
            currency
            homeNotional
            time
            tradingId
        }
    }
`

export const service = {
    /**
     * Query candles
     * @param symbol The Cryptocurrency unique code
     * @param timeframe The period of time
     * @returns returns an array of candles.
     */
    async getCandles (symbol: string, timeframe: Timeframe): Promise<IBar[]> {
        const { candles } = await request(GRAPHQL_URL, GET_CANDLES, { symbol, timeframe })
        return candles
    },
    /**
     * Query position status
     * @param symbol The Cryptocurrency unique code
     * @returns returns a status of open position
     */
    async getPositionStatus (symbol: string): Promise<IPositionStatus> {
        const { positionStatus } = await request(GRAPHQL_URL, GET_POSITION_STATUS, { symbol })
        if (positionStatus.conditionalEntryPrice === null) {
            positionStatus.conditionalEntryPrice = undefined
        }
        return positionStatus
    },
    /**
     * Query open position
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position
     */
    async getOpenPosition (symbol: string): Promise<IPosition | null> {
        const { openPosition } = await request(GRAPHQL_URL, GET_OPEN_POSITION, { symbol })
        if (!openPosition.symbol) {
            return null
        }
        return openPosition
    },
    /**
     * Change position 'None' to 'Enter'
     * @param symbol The Cryptocurrency unique code
     * @param direction long | short
     * @param entryPrice The price when enter
     * @returns returns a open position when status is Enter
     */
    async enterPosition (symbol: string, direction: TradeDirection, entryPrice: number, tradingId: string): Promise<IPosition> {
        const { enterPosition } = await request(GRAPHQL_URL, ENTER_POSITION, { symbol, direction, entryPrice, tradingId })
        return enterPosition
    },
    /**
     * Change position 'Enter' to 'Position'
     * @param symbol The Cryptocurrency unique code
     * @param position The open position
     * @returns returns a open position when status is Position
     */
    async createPosition (symbol: string, position: IPosition): Promise<IPosition> {
        const { createPosition } = await request(GRAPHQL_URL, CREATE_POSITION, { symbol, position })
        return createPosition
    },
    /**
     * Change not position
     * @param position The open position
     * @returns returns a open position when status is Position
     */
    async updatePosition (position: IPosition): Promise<IPosition> {
        const { updatePosition } = await request(GRAPHQL_URL, UPDATE_POSITION, { position })
        return updatePosition
    },
    /**
     * Change positions 'Position' to 'Exit'
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position when status is Exit
     */
    async exitPosition (symbol: string): Promise<IPosition> {
        const { exitPosition } = await request(GRAPHQL_URL, EXIT_POSITION, { symbol })
        return exitPosition
    },
    /**
     * Change position 'Exit' to 'None'
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position when status is None
     */
    async closePosition (symbol: string): Promise<IPosition> {
        const { closePosition } = await request(GRAPHQL_URL, CLOSE_POSITION, { symbol })
        return closePosition
    },
    /**
     * Query completed trades
     * @param symbol The Cryptocurrency unique code
     * @returns returns completed trades
     */
    async completedTrades (symbol: string): Promise<ITrade[]> {
        const { completedTrades } = await request(GRAPHQL_URL, GET_COMPLETED_TRADES, { symbol })
        return completedTrades
    },
    /**
     * Query trading
     * @param tradingId
     * @returns returns a trading
     */
    async completedTrading (tradingId: string): Promise<ITrade> {
        const { completedTrading } = await request(GRAPHQL_URL, GET_COMPLETED_TRADING, { tradingId })
        return completedTrading
    },
    /**
     * Create or Update trade
     * @param trade
     * @returns returns completed trades
     */
    async updateTrading (trade: ITrade): Promise<ITrade> {
        const { updateTrading } = await request(GRAPHQL_URL, UPDATE_COMPLETED_TRADING, { trade })
        return updateTrading
    },
    /**
     * Cancel trading
     * @param tradingId
     * @returns
     */
    async removeTrading (tradingId: string): Promise<Boolean> {
        const { removeTrade } = await request(GRAPHQL_URL, REMOVE_COMPLETED_TRADING, { tradingId })
        return removeTrade
    },
    /**
     * TBD
     * @param order
     * @returns
     */
    async ordersBySymbol (order: IOrder): Promise<IOrder[]> {
        const { orderSymbol } = await request(GRAPHQL_URL, GET_ORDER_BY_SYMBOL, { order })
        return orderSymbol
    },
    /**
     * TBD
     * @param tradingId
     * @returns
     */
    async ordersByTrading (tradingId: string): Promise<IOrder[]> {
        const { orderTrading } = await request(GRAPHQL_URL, GET_ORDER_BY_TRADING, { tradingId })
        return orderTrading
    },
    /**
     * TBD
     * @param order
     * @returns
     */
    async updateOrder (order: IOrder): Promise<IOrder> {
        const { updateOrder } = await request(GRAPHQL_URL, UPDATE_ORDER, { order })
        return updateOrder
    }
}
