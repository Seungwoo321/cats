const graphqlServer = require('./graphql-server')

; (async function () {
    await graphqlServer()
    // httpServer.on('listening', () => {
    //     console.log('listening')
    // })
    // httpServer.on('upgrade', () => {
    //     console.log('upgrade')
    // })
}())
