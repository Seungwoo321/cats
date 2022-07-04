const http = require('http')
const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
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

    // Resolvers context from WebSocket
    // const subscriptions = {
    //     path: '/graphql',
    //     onConnect: async (connection, websocket) => {
    //         console.log(connection, websocket)
    //         let contextData = {}
    //         try {
    //             contextData = await autoCall(context, {
    //                 connection,
    //                 websocket
    //             })
    //             contextData = Object.assign({}, contextData, { pubsub })
    //         } catch (e) {
    //             console.error(e)
    //             throw e
    //         }
    //         console.log(contextData)
    //         return contextData
    //     }
    // }
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    
    // Express app
    const app = express()
    const httpServer = http.createServer(app)
    httpServer.setTimeout(1000000)
    
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql'
    })

    const serverCleanup = useServer({
        schema,
        onConnect: async (ctx) => {
            // Check authentication every time a client connects.
            console.log('Connect')
        },
        onDisconnect(ctx, code, reason) {
            console.log('Disconnected!');
        },
    }, wsServer);

    // Set up Apollo Server
    const server = new ApolloServer({
        schema,
        // tracing: true,
        // cacheControl: true,
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
                    console.log(connection)
                    contextData = await autoCall(context, { connection })
                } else {
                    contextData = await autoCall(context, { req })
                }
            } catch (e) {
                console.error(e)
                throw e
            }
            contextData = Object.assign({}, contextData, { pubsub })
            // console.log(contextData)
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
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
        // subscriptions,
        // introspection: true,
        // playground: true,
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
            console.log(server.subscriptionsPath)
            console.log(`✔️  GraphQL Server is running on ${chalk.cyan(`http://localhost:${PORT}${server.graphqlPath}`)}`)
            if (process.env.NODE_ENV !== 'production' && !process.env.CATS_CLI_API_MODE) {
                console.log(`✔️  Type ${chalk.cyan('rs')} to restart the server`)
            }
            // cb && cb()
        })
        // const port = process.env.PORT || 4000
        // server.listen({ port }).then(({ url }) => {
        //     console.log(`
        //     🚀  Server is ready at ${url}
        //     📭  Query at https://studio.apollographql.com/dev
        // `)
        // })
    }
    // wsServer.on('error', function (err) {
    //     console.log('error')
    // })

    // wsServer.on('connection', function connection(ws) {
    //     console.log('connection')
    //     ws.send('success')
    //     ws.ping('ping')
    // });
    // wsServer.on('close', function () {
    //     console.log('close')
    // })
    // wsServer.on('open', function open() {
    //     console.log('open');
    // });
    return {
        apolloServer: server,
        httpServer
    }
}
// // export all the important pieces for integration/e2e tests to use
// module.exports = {
//     dataSources,
//     context,
//     typeDefs,
//     resolvers,
//     ApolloServer,
//     CandleAPI,
//     OpenPositionAPI,
//     PositionStatusAPI,
//     server
// }
