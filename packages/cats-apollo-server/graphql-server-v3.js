const http = require('http')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { chalk } = require('@cats/shared-utils')
const typeDefs = require('./type-defs')
const resolvers = require('./resolvers')
const context = require('./context')
const pubsub = require('./pubsub')
const CandleAPI = require('./datasources/CandleApi')
const OpenPositionAPI = require('./datasources/OpenPositionApi')
const PositionStatusAPI = require('./datasources/PositionStatusApi')
const CompletedTradeAPI = require('./datasources/CompletedTradeApi')
const OrderHistoryAPI = require('./datasources/OrderHistoryApi')

function autoCall(fn, ...context) {
    if (typeof fn === 'function') {
        return fn(...context)
    }
    return fn
}

module.exports = async () => {

    const dataSources = () => ({
        candleAPI: new CandleAPI(),
        openPositionAPI: new OpenPositionAPI(),
        positionStatusAPI: new PositionStatusAPI(),
        completedTradeAPI: new CompletedTradeAPI(),
        orderHistoryAPI: new OrderHistoryAPI()
    })

    // Realtime subscriptions
    if (!pubsub) pubsub = new PubSub()

    const app = express()
    
    const httpServer = http.createServer(app)
    httpServer.setTimeout(1000000)

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql'
    })

    const serverCleanup = useServer({
        schema,
        onConnect: async (ctx) => {
            console.log('Connect')
        },
        onDisconnect(ctx, code, reason) {
            console.log('Disconnected!')
        },
    }, wsServer)

    // Set up Apollo Server
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: "bounded",
        cors: {
            origin: '*'
        },
        dataSources,
        context: async ({ req, connection }) => {
            let contextData
            try {
                if (connection) {
                    contextData = await autoCall(context, { connection })
                } else {
                    contextData = await autoCall(context, { req })
                }
            } catch (e) {
                console.error(e)
                throw e
            }
            contextData = Object.assign({}, contextData, { pubsub })
            return contextData
        },
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),

            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose()
                        },
                    };
                },
            },
        ],
    })

    await server.start()
    server.applyMiddleware({
        app,
        path: '/graphql',
        cors: {
            origin: '*'
        }
    })
    if (process.env.NODE_ENV !== 'test') {
        const PORT = process.env.PORT || 4000
        httpServer.listen(PORT, () => {
            console.log(`🚀  GraphQL Server is running on ${chalk.cyan(`http://localhost:${PORT}${server.graphqlPath}`)}`)
            if (process.env.NODE_ENV !== 'production' && !process.env.CATS_CLI_API_MODE) {
                console.log(`✔️  Type ${chalk.cyan('rs')} to restart the server`)
            }
        })
    }
    return {
        apolloServer: server,
        httpServer
    }
}
