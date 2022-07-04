import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { split } from '@apollo/client/link/core'
import { HttpLink } from '@apollo/client/link/http'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'
// GraphQL documents
import LOADING_CHANGE from '@/graphql/loading/loadingChange.gql'

// Install the vue plugi
Vue.use(VueApollo)

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000',
  keepAlive: 10_000, // ping server every 10 seconds,
  shouldRetry: true,
  on: {
    connected: (socket) => (console.log(socket))
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
  }
}))

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
  websocketsOnly: true,
  connectToDevTools: true
})

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    }
  },
  watchLoading (state, mod) {
    apolloClient.mutate({
      mutation: LOADING_CHANGE,
      variables: {
        mod
      }
    })
  },
  errorHandler (error) {
    console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;')
    console.log(error.message)
    if (error.graphQLErrors) {
      console.log(error.graphQLErrors)
    }
    if (error.networkError) {
      console.log(error.networkError)
    }
  }
})

export async function resetApollo () {
  console.log('[UI] Apollo store reset')

  // if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
}

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
// wsLink.client.on('connected', () => {
//   console.log('connected')
// })
// wsLink.on('connected', () => {
//   console.log('connected')
//   setConnected(true)
// })
// wsLink.on('reconnected', async () => {
//   // await resetApollo()
//   console.log('reconnected')
//   setConnected(true)
// })
// // Offline
// wsLink.on('disconnected', () => {
//   console.log('disconnected')
//   setConnected(false)
// })
// wsLink.on('error', (err) => {
//   console.log('error', err)
//   setConnected(false)
// })
