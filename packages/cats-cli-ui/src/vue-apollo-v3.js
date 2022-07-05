import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
// state
import clientStateDefaults from './state/defaults'
import clientStateResolvers from './state/resolvers'
import clientStateTypeDefs from './state/typeDefs'
// GraphQL documents
import CONNECTED_SET from '@/graphql/connected/connectedSet.gql'
import LOADING_CHANGE from '@/graphql/loading/loadingChange.gql'

// Install the vue plugin
Vue.use(VueApollo)

/* Connected state */
function setConnected (value) {
  apolloClient.mutate({
    mutation: CONNECTED_SET,
    variables: {
      value
    }
  })
  console.log(cache)
}

const listener = {
  connected: async () => {
    await apolloClient.resetStore()
    console.log('connected')
    setConnected(true)
  },
  closed: () => {
    console.log('closed')
    setConnected(false)
  },
  error: () => {
    console.log('error')
    setConnected(false)
  }
}
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})
const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
  lazy: false,
  shouldRetry: () => true,
  keepAlive: 10_000,
  on: listener
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
const cache = new InMemoryCache()
export const apolloClient = new ApolloClient({
  link,
  cache,
  connectToDevTools: true,
  typeDefs: clientStateTypeDefs,
  resolvers: clientStateResolvers
})

apolloClient.onResetStore(() => {
  console.log('[UI] Apollo store reset')
  try {
    cache.writeData({ data: clientStateDefaults() })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
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
