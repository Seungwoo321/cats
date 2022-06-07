const gql = require('graphql-tag')

exports.types = gql`
    type Query {
        completedTrades(symbol: String): [ITrade]
        completedTrading(tradingId: String): ITrade
        ordersBySymbol(symbol: String): [IOrder]
        ordersByTrading(tradingId: String): [IOrder]
    }

    type Mutation {
        updateTrading(trade: InputTrade): ITrade
        removeTrading(tradingId: String): ITrade
        updateOrder(order: InputOrder): IOrder

    }

    type ITrade {
        tradingId: String
        symbol: String
        direction: TradeDirection
        entryTime: Date
        entryPrice: Float
        growth: Float
        profit: Float
        profitPct: Float
        holdingPeriod: Int
        amount: Float
        exitTime: Date
        exitPrice: Float
        exitReason: String
        stopPrice: Float
        finalCapital: Float
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

    input InputTrade {
        tradingId: String
        symbol: String
        direction: TradeDirection
        entryTime: Date
        entryPrice: Float
        growth: Float
        profit: Float
        profitPct: Float
        holdingPeriod: Int
        amount: Float
        exitTime: Date
        exitPrice: Float
        exitReason: String
        stopPrice: Float
        finalCapital: Float
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

    enum OrderStatus {
        New
        PartiallyFilled
        Filled
        Canceled
        Rejected
    }
`

exports.resolvers = {
    Query: {
        completedTrades: async (_, { symbol }, { dataSources }) => {
            return await dataSources.completedTradeAPI.findTradingBySymbol({ symbol })
        },
        completedTrading: async (_, { tradingId }, { dataSources }) => {
            return await dataSources.completedTradeAPI.findTrading({ tradingId })
        },
        ordersBySymbol: async (_, { symbol }, { dataSources }) => {
            return await dataSources.orderHistoryAPI.findOrdersBySymbol({ symbol })
        },
        ordersByTrading: async (_, { tradingId }, { dataSources }) => {
            return await dataSources.orderHistoryAPI.findOrdersByTrading({ tradingId })
        }
    },
    Mutation: {
        updateTrading: async (_, { trade }, { dataSources }) => {
            return await dataSources.completedTradeAPI.updateTrading({ values: trade })
        },
        removeTrading: async (_, { tradingId }, { dataSources }) => {
            return await dataSources.completedTradeAPI.removeTrading({ tradingId })
        },
        updateOrder: async (_, { order }, { dataSources }) => {
            return await dataSources.orderHistoryAPI.updateOrder({ values: order })
        }
    }
}
