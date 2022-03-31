require('module-alias/register')
require('@config')

const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./schema')
const resolvers = require('./resolvers')
const { createStore } = require('./utils')
const CandleAPI = require('./datasources/candle')
const OpenPositionAPI = require('./datasources/openPosition')
const PositionStatusAPI = require('./datasources/positionStatus')
const CompletedTradeAPI = require('./datasources/completedTrade')
const OrderHistoryAPI = require('./datasources/orderHistory')
// const internalEngineDemo = require('./engine-demo')
const store = createStore()

// set up any dataSources our resolvers need
const dataSources = () => ({
    candleAPI: new CandleAPI(store.influx2),
    openPositionAPI: new OpenPositionAPI(store.mariadb.OpenPosition),
    positionStatusAPI: new PositionStatusAPI(store.mariadb.PositionStatus),
    completedTradeAPI: new CompletedTradeAPI(store.mariadb.CompletedTrade),
    orderHistoryAPI: new OrderHistoryAPI(this.store.mariadb.OrderHistory)
})

// the function that sets up the global context for each resolver, using the req
const context = async ({ req }) => {
    return req
}

// Set up Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context,
    introspection: true,
    playground: true
})

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
    server.listen().then(() => {
        console.log(`
      Server is running!
      Listening on port 4000
      Query at https://studio.apollographql.com/dev
    `)
    })
}

// export all the important pieces for integration/e2e tests to use
module.exports = {
    dataSources,
    context,
    typeDefs,
    resolvers,
    ApolloServer,
    CandleAPI,
    OpenPositionAPI,
    PositionStatusAPI,
    CompletedTradeAPI,
    OrderHistoryAPI,
    store,
    server
}
