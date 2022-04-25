const gql = require('graphql-tag')

exports.types = gql`
    type Query {
        candles(symbol: String, timeframe: String, start: Int, stop: Int): [IBar]
    }

    type Mutation {
        updateCandle(bar: IBar): IBar
    }

    type IBar {
        time: Date!
        open: Float!
        high: Float!
        low: Float!
        close: Float!
        volume: Float!
    }
`

exports.resolvers = {
    Query: {
        candles: async (_, { symbol, timeframe = '1h', start, stop }, { dataSources }) => {
            return await dataSources.candleAPI.getCandles({ symbol, timeframe, start, stop })
        }
    },
    Mutation: {
        updateCandle: async (_, { symbol, timeframe = '1h', bar }, { dataSources }) => {
            return await dataSources.candleAPI.updateCandle({ symbol, timeframe, bar})
        }
    }
}
