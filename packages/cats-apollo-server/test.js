const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const typeDefs = require('./type-defs');
const resolvers = require('./resolvers');
const { makeExecutableSchema } = require('@graphql-tools/schema');
// const cors = require('cors')

async function startApolloServer(typeDefs, resolvers) {
    try {
        // Required logic for integrating with Express
        const app = express();
        // app.use(cors())
        const httpServer = http.createServer(app);

        // SCHEMA
        const schema = makeExecutableSchema({ typeDefs, resolvers })

        // Create Web Socket
        const wsServer = new WebSocketServer({
            server: httpServer,
            path: '/graphql'
        });

        //  console.log(`webSock: ${JSON.stringify(wsServer, null, 1)}`);

        const serverCleanup = useServer({ schema }, wsServer);

        // Same ApolloServer initialization as before, plus the drain plugin.
        const server = new ApolloServer({
            schema,
            plugins: [
                ApolloServerPluginDrainHttpServer({ httpServer }),
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                await serverCleanup.dispose();
                            }
                        }
                    }
                }
            ],
        });

        await server.start()
        server.applyMiddleware({ app });

        const PORT = 4000;
        // Now that our HTTP server is fully set up, we can listen to it.
        httpServer.listen(PORT, () => {
            console.log(
                `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
            );
            console.log(
                `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
            );
        });
    } catch (error) {
        console.error('ERR', error)
    }
}


startApolloServer(typeDefs, resolvers);