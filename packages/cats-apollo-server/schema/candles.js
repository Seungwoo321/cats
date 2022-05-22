const gql = require('graphql-tag')

exports.types = gql`
    type Query {
        candles(exchange: String, mode: String, symbol: String, timeframe: String, start: Int, stop: Int): [IBar]
    }

    type Mutation {
        updateCandle(exchange: String, mode: String, symbol: String, timeframe: String, bar: InputBar): IBar
    }
    input InputBar {
        time: Date!
        open: Float!
        high: Float!
        low: Float!
        close: Float!
        volume: Float!
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
        candles: async (_, { exchange, mode, symbol, timeframe = '1h', start, stop }, { dataSources }) => {
            return await dataSources.candleAPI.getCandles({ exchange, mode, symbol, timeframe, start, stop })
        }
    },
    Mutation: {
        updateCandle: async (_, { exchange, mode, symbol, timeframe = '1h', bar }, { dataSources }) => {
            return await dataSources.candleAPI.updateCandle({ exchange, mode, symbol, timeframe, bar})
        }
    }
}
