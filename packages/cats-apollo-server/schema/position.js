const gql = require('graphql-tag')

exports.types = gql`
    type Query {
        positionStatus(symbol: String): IPositionStatus
        openPosition(symbol: String): IPosition
    }

    type Mutation {
        updatePosition(position: InputPosition): IPosition
        createPosition(symbol: String, position: InputPosition): IPosition
        enterPosition(symbol: String, direction: TradeDirection, entryPrice: Float): IPositionStatus
        exitPosition(symbol: String): IPositionStatus
        closePosition(symbol: String): IPositionStatus
    }

    type IPosition {
        positionId: String
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
        positionId: String
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

    type IPositionStatus {
        symbol: String
        direction(direction: TradeDirection): String
        conditionalEntryPrice: Float
        tradingId: String
        value(status: Status): String
    }

    enum Status {
        None
        Enter
        Position
        Exit
    }
`

exports.resolvers = {
    Query: {
        /** positionStatus */
        positionStatus: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatus({ symbol })
        },
        /** openPosition */
        openPosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.openPositionAPI.getPosition({ symbol })
        }
    },
    Mutation: {
        /** positionStatus & openPosition */
        createPosition: async (_, { symbol, position }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Position' } }) &&
                await dataSources.openPositionAPI.createPosition(position)
        },
        closePosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.openPositionAPI.closePostion({ symbol }) &&
                await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'None', conditionalEntryPrice: null } })
        },
        /** positionStatus */
        enterPosition: async (_, { symbol, direction = 'long', entryPrice }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Enter', direction, conditionalEntryPrice: entryPrice } })
        },
        exitPosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Exit' } })
        },
        /** openPosition */
        updatePosition: async (_, { position }, { dataSources }) => {
            return await dataSources.openPositionAPI.updatePosition({ values: position })
        }
    }
}
