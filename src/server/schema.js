import { gql } from 'apollo-server'

export const typeDefs = gql`
    scalar Date

    enum TradeDirection {
        Long
        Short
    }
    enum Status {
        None
        Enter
        Position
        Exit
    }
    type IPositionStatus {
        symbol: String
        direction(direction: TradeDirection): String
        conditionalEntryPrice: Float
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
    type Query {
        positionStatus(symbol: String): IPositionStatus
        openPosition(symbol: String): IPosition
        candles(symbol: String, timeframe: String): [IBar]
    }
    type Mutation {
        updatePosition(position: InputPosition): IPosition
        openPosition(symbol: String, position: InputPosition): IPosition
        enterPosition(symbol: String, direction: TradeDirection, entryPrice: Float): IPositionStatus
        exitPosition(symbol: String): IPositionStatus
        closePosition(symbol: String): IPositionStatus
    }
`
