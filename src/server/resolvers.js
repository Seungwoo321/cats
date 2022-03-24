
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
        // To do
        completedTrade: async (_, { symbol }, { dataSources }) => {
            return await dataSources.completedTradeAPI.completedTrade({ symbol })
        },
        positionStatus: async (_, { symbol }, { dataSources }) => {
            return await dataSources.positionStatusAPI.positionStatus({ symbol })
        },
        openPosition: async (_, { symbol }, { dataSources }) => {
            return await dataSources.openPositionAPI.getPosition({ symbol })
        },
        candles: async (_, { symbol, timeframe = '1h' }, { dataSources }) => {
            return await dataSources.candleAPI.getCandles({ symbol, timeframe })
        }
    },
    Mutation: {
        // To do
        createTrade: async (_, data, { dataSources }) => {
            return await dataSources.completedTradeAPI
        },
        // To do
        updateTrade: async (_, data, { dataSources }) => {
            return await dataSources.completedTradeAPI
        },
        updatePosition: async (_, { position }, { dataSources }) => {
            return await dataSources.openPositionAPI.updatePosition({ values: position })
        },
        openPosition: async (_, { symbol, position }, { dataSources }) => {
            const positionStatus = await dataSources.positionStatusAPI.positionStatus({ symbol })
            return positionStatus.value === 'Enter' &&
                await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Position' } }) &&
                await dataSources.openPositionAPI.findOrCreatePosition(position)
        },
        enterPosition: async (_, { symbol, direction = 'Long', entryPrice }, { dataSources }) => {
            const positionStatus = await dataSources.positionStatusAPI.positionStatus({ symbol })
            return positionStatus.value === 'None' &&
                await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Enter', direction, conditionalEntryPrice: entryPrice } })
        },
        exitPosition: async (_, { symbol }, { dataSources }) => {
            const positionStatus = await dataSources.positionStatusAPI.positionStatus({ symbol })
            return positionStatus.value === 'Position' &&
                await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'Exit' } })
        },
        closePosition: async (_, { symbol }, { dataSources }) => {
            const positionStatus = await dataSources.positionStatusAPI.positionStatus({ symbol })
            return (positionStatus.value === 'Position' || positionStatus.value === 'Exit') &&
                await dataSources.openPositionAPI.closePostion({ symbol }) &&
                await dataSources.positionStatusAPI.positionStatusUpdate({ values: { symbol, value: 'None', conditionalEntryPrice: null } })
        }
    },
    Date: dateScalar
}
