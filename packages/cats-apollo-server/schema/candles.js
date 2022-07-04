const gql = require('graphql-tag')
const { debug } = require('@cats/shared-utils')
const logger = debug('cats:apollo-server')
const channels = require('../channels')
exports.types = gql`
    type Query {
        candles(token: String, exchange: String, mode: String, symbol: String, timeframe: String, start: Int, stop: Int): [IBar]
    }

    type Mutation {
        updateCandle(token: String, exchange: String, mode: String, symbol: String, timeframe: String, bar: InputBar): IBar
        importCandles(token: String, exchange: String, mode: String, symbol: String, timeframe: String, bars: [InputBar]): IBar
    }

    type Subscription {
        candleUpdaated: IBar
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
        candles: async (_, { token, exchange, mode, symbol, timeframe = '1h', start, stop }, { dataSources }) => {
            logger(`candles - ${exchange} ${mode} ${symbol} ${timeframe} ${start} ${stop}`)
            return await dataSources.candleAPI.getCandles({ token, exchange, mode, symbol, timeframe, start, stop })
        }
    },

    Mutation: {
        updateCandle: async (_, { token, exchange, mode, symbol, timeframe = '1h', bar }, { dataSources }) => {
            logger(`updateCandle - ${exchange} ${mode} ${symbol} ${timeframe} ${JSON.stringify(bar)}`)
            return await dataSources.candleAPI.updateCandle({ token, exchange, mode, symbol, timeframe, bar})
        },
        importCandles: async (_, { token, exchange, mode, symbol, timeframe = '1h', bars }, { dataSources }) => {
            logger(`importCandles - ${exchange} ${mode} ${symbol} ${timeframe} ${bars.length}`)
            return await dataSources.candleAPI.importCandles({ token, exchange, mode, symbol, timeframe, bars })
        },
    },

    Subscription: {
        candleUpdaated: {
            subscribe: (_, { }, context) => context.pubsub.asyncIterator(channels.CANDLE_UPDATED)
        }
    }
}
