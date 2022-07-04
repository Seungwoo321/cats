import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
// import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { GraphQLWsLink } from './apllo-client'
import { createClient } from 'graphql-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
// GraphQL documents
// import LOADING_CHANGE from '@/graphql/loading/loadingChange.gql'

// Install the vue plugin
Vue.use(VueApollo)

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
  // webSocketImpl: ws,
  shouldRetry: () => true
  // keepAlive: 10_000, // ping server every 10 seconds,
  // shouldRetry: true,
  // on: {
  // connected: (socket) => (console.log(socket))
  // ping: (received) => {
  //   if (!received) {
  //     timedOut = setTimeout(() => {
  //       if (activeSocket.readyState === WebSocket.OPEN) { activeSocket.close(4408, 'Request Timeout') }
  //     }, 5_000)
  //   } // wait 5 seconds for the pong and then close the connection
  // },
  // pong: (received) => {
  //   if (received) {
  //     // clearTimeout(timedOut)
  //   }
  //   console.log(received)
  // }
  // }
}))
console.log(wsLink)
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' &&
      operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Create the apollo client
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

apolloClient.wsClient = wsLink.client

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
  // defaultOptions: {
  //   $query: {
  //     fetchPolicy: 'cache-and-network',
  //     errorPolicy: 'all'
  //   }
  // },
  // watchLoading (state, mod) {
  //   apolloClient.mutate({
  //     mutation: LOADING_CHANGE,
  //     variables: {
  //       mod
  //     }
  //   })
  // },
  // errorHandler (error) {
  //   console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;')
  //   console.log(error.message)
  //   if (error.graphQLErrors) {
  //     console.log(error.graphQLErrors)
  //   }
  //   if (error.networkError) {
  //     console.log(error.networkError)
  //   }
  // }
})

// export async function resetApollo () {
//   console.log('[UI] Apollo store reset')

//   // if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
//   try {
//     await apolloClient.resetStore()
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
//   }
// }

/* Connected state */

// function setConnected (value) {
//   console.log(value)
//   // apolloClient.mutate({
//   //     mutation: CONNECTED_SET,
//   //     variables: {
//   //         value
//   //     }
//   // })
// }
// apolloClient.wsClient.on('connected', () => {
//   console.log('connected')
// })
// console.log(apolloClient.wsClient)
// apolloClient.wsClient.on('disconnected', () => {
//   console.log('disconnected')
// })
// console.log(wsLink)
// wsLink.client.on('connected', () => {
//   console.log('connected')
//   setConnected(true)
// })
// wsLink.client.on('reconnected', async () => {
//   // await resetApollo()
//   console.log('reconnected')
//   setConnected(true)
// })
// Offline
// wsLink.client.on('disconnected', () => {
//   console.log('disconnected')
//   setConnected(false)
// })
// wsLink.client.on('error', (err) => {
//   console.log('error', err)
//   setConnected(false)
// })
