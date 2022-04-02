const { gql } = require('apollo-server')

const typeDefs = gql`
    scalar Date

    enum TradeDirection {
        long
        short
    }
    enum Status {
        None
        Enter
        Position
        Exit
    }
    enum OrderStatus {
        New
        PartiallyFilled
        Filled
        Canceled
    }
    type IPositionStatus {
        symbol: String
        direction(direction: TradeDirection): String
        conditionalEntryPrice: Float
        tradingId: String
        value(status: Status): String
    }
    type IBar {
        time: Date!
        open: Float!
        high: Float!
        low: Float!
        close: Float!
        volume: Float!
    }
    input InputBar {
        time: Date!
        open: Float!
        high: Float!
        low: Float!
        close: Float!
        volume: Float!
    }
    type IPosition {
        symbol: String
        direction: TradeDirection
        entryTime: Date
        entryPrice: Float
        growth: Float
        profit: Float
        profitPct: Float
        holdingPeriod: Int
        initialStopPrice: Float
        curStopPrice: Float
        profitTarget: Float
        initialUnitRisk: Float
        initialRiskPct: Float
        curRiskPct: Float
        curRMultiple: Float
        amount: Float
    }
    input InputPosition {
        symbol: String
        direction: String
        entryTime: Date
        entryPrice: Float
        growth: Float
        profit: Float
        profitPct: Float
        holdingPeriod: Int
        initialStopPrice: Float
        curStopPrice: Float
        profitTarget: Float
        initialUnitRisk: Float
        initialRiskPct: Float
        curRiskPct: Float
        curRMultiple: Float
        amount: Float
    }
    type ITimestampedValue {
        time: Date
        value: String
    }
    type ITrade {
        tradingId: String
        symbol: String
        direction: TradeDirection
        entryTime: Date
        entryPrice: Float
        exitTime: Date
        exitPrice: Float
        profit: Float
        profitPct: Float
        exitReason: String
        qty: Float
    }
    input InputTrade {
        tradingId: String
        symbol: String
        direction: TradeDirection
        entryTime: Date
        entryPrice: Float
        exitTime: Date
        exitPrice: Float
        profit: Float
        profitPct: Float
        exitReason: String
        qty: Float
    }
    type IOrder {
        orderId: String
        tradingId: String
        time: Date
        symbol: String
        lastQty: Float
        orderQty: Float
        leavesQty: Float
        lastPrice: Float
        price: Float
        avgPrice: Float
        stopPrice: Float
        side: String
        ordType: String
        ordStatus: OrderStatus
        currency: String
        homeNotional: Float
        text: String
    }
    input InputOrder {
        orderId: String
        tradingId: String
        time: Date
        symbol: String
        lastQty: Float
        orderQty: Float
        leavesQty: Float
        lastPrice: Float
        price: Float
        avgPrice: Float
        stopPrice: Float
        side: String
        ordType: String
        ordStatus: OrderStatus
        currency: String
        homeNotional: Float
        text: String
    }
    type Query {
        completedTrades(symbol: String): [ITrade]
        completedTrading(tradingId: String): ITrade
        ordersBySymbol(symbol: String): [IOrder]
        ordersByTrading(tradingId: String): [IOrder]
        positionStatus(symbol: String): IPositionStatus
        openPosition(symbol: String): IPosition
        candles(symbol: String, timeframe: String): [IBar]
    }
    type Mutation {
        updateTrading(trade: InputTrade): ITrade
        removeTrading(tradingId: String): ITrade
        updateOrder(order: InputOrder): IOrder
        updatePosition(position: InputPosition): IPosition
        createPosition(symbol: String, position: InputPosition): IPosition
        enterPosition(symbol: String, direction: TradeDirection, entryPrice: Float, tradingId: String): IPositionStatus
        exitPosition(symbol: String): IPositionStatus
        closePosition(symbol: String): IPositionStatus
    }
`
module.exports = {
    typeDefs
}
