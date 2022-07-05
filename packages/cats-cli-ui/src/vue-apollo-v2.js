import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { split } from '@apollo/client/link/core'
import { HttpLink } from '@apollo/client/link/http'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
// GraphQL documents
import CONNECTED_SET from '@/graphql/connected/connectedSet.gql'
import LOADING_CHANGE from '@/graphql/loading/loadingChange.gql'

// Install the vue plugin
Vue.use(VueApollo)

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true
  }
})

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

apolloClient.wsClient = wsLink.subscriptionClient

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
function setConnected (value) {
  apolloClient.mutate({
    mutation: CONNECTED_SET,
    variables: {
      value
    }
  })
}
apolloClient.wsClient.on('connected', () => {
  console.log('connected')
  setConnected(true)
})
apolloClient.wsClient.on('reconnected', async () => {
  await resetApollo()
  console.log('reconnected')
  setConnected(true)
})
// Offline
apolloClient.wsClient.on('disconnected', () => {
  console.log('disconnected')
  setConnected(false)
})
apolloClient.wsClient.on('error', (err) => {
  console.log('error', err)
  setConnected(false)
})
