const gql = require('graphql-tag')

exports.types = gql`
    type Query {
        positionStatus(symbol: String): IPositionStatus
        openPosition(symbol: String): IPosition
    }

    type Mutation {
        createPosition(position: InputPosition): IPosition
        updatePosition(position: InputPosition): IPosition
        closePosition(symbol: String): IPosition
        updatePositionStatusEnter(symbol: String, direction: TradeDirection, entryPrice: Float): IPositionStatus
        updatePositionStatusExit(symbol: String): IPositionStatus
        updatePositionStatusPosition(symbol: String): IPositionStatus
        updatePositionStatusNone(symbol: String): IPositionStatus
        updatePositionCapital(symbol: String, capital: Float): IPositionStatus
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
        amount: Float
        initialStopPrice: Float
        curStopPrice: Float
        profitTarget: Float
    }

    input InputPosition {
        positionId: String
        symbol: String
        direction: TradeDirection
        entryTime: Date
        entryPrice: Float
        growth: Float
        profit: Float
        profitPct: Float
        holdingPeriod: Int
        amount: Float
        initialStopPrice: Float
        curStopPrice: Float
        profitTarget: Float
    }

    type IPositionStatus {
        symbol: String
        direction(direction: TradeDirection): String
        conditionalEntryPrice: Float
        startingCapital: Float
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
        /** openPosition */
        createPosition: async (_, { position }, { dataSources }) => {
            return await dataSources.openPositionAPI.createPosition(position)
                && await dataSources.openPositionAPI.getPosition({ symbol })
        },
        updatePosition: async (_, { position }, { dataSources }) => {
            return await dataSources.openPositionAPI.updatePosition({ values: position })
                && await dataSources.openPositionAPI.getPosition({ symbol })
        },
        closePosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.openPositionAPI.closePostion({ symbol })
                && await dataSources.openPositionAPI.getPosition({ symbol })
        },
        /** positionStatus */
        updatePositionStatusEnter: async (_, { symbol, direction = 'long', entryPrice }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Enter', direction, conditionalEntryPrice: entryPrice } })
        },
        updatePositionStatusExit: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Exit' } })
        },
        updatePositionStatusPosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Position' } })
        },
        updatePositionStatusNone: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'None', direction: null, conditionalEntryPrice: null } })
        },
        updatePositionCapital: async (_, { symbol, capital }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, startingCapital: capital }})
        }
    }
}
