
const { GraphQLScalarType, Kind } = require('graphql')

const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize (value) {
        return value.getTime() // Convert outgoing Date to integer for JSON
    },
    parseValue (value) {
        return new Date(value) // Convert incoming integer to Date
    },
    parseLiteral (ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10)) // Convert hard-coded AST string to integer and then to Date
        }
        return null // Invalid hard-coded value (not an integer)
    }
})

module.exports = {
    Query: {
        /** compltedTrade */
        completedTrades: async (_, { symbol }, { dataSources }) => {
            return await dataSources.completedTradeAPI.findTradeBySymbol({ symbol })
        },
        /** orderHistory */
        ordersBySymbol: async (_, { symbol }, { dataSources }) => {
            return await dataSources.orderHistoryAPI.ordersBySymbol({ symbol })
        },
        ordersByTrading: async (_, { tradingId }, { dataSources }) => {
            return await dataSources.orderHistoryAPI.ordersByTrading({ tradingId })
        },
        /** positionStatus */
        positionStatus: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatus({ symbol })
        },
        /** openPosition */
        openPosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.openPositionAPI.getPosition({ symbol })
        },
        /** candles */
        candles: async (_, { symbol, timeframe = '1h' }, { dataSources }) => {
            return await dataSources.candleAPI.getCandles({ symbol, timeframe })
        }
    },
    Mutation: {
        /** completedTrade */
        updateTrading: async (_, { trade }, { dataSources }) => {
            return await dataSources.completedTradeAPI.updateTrading({ values: trade })
        },
        removeTradind: async (_, { tradingId }, { dataSources }) => {
            return await dataSources.completedTradeAPI.removeTradind({ tradingId })
        },
        /** orderHistory */
        updateOrder: async (_, { order }, { dataSources }) => {
            return await dataSources.orderHistoryAPI.updateOrder({ values: order })
        },
        /** positionStatus & openPosition */
        openPosition: async (_, { symbol, position }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Position' } }) &&
                await dataSources.openPositionAPI.findOrCreatePosition(position)
        },
        closePosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.openPositionAPI.closePostion({ symbol }) &&
                await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'None', conditionalEntryPrice: null } })
        },
        /** positionStatus */
        enterPosition: async (_, { symbol, direction = 'long', entryPrice, tradingId }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Enter', direction, conditionalEntryPrice: entryPrice, tradingId } })
        },
        exitPosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Exit' } })
        },
        /** openPosition */
        updatePosition: async (_, { position }, { dataSources }) => {
            return await dataSources.openPositionAPI.updatePosition({ values: position })
        }
    },
    Date: dateScalar
}
