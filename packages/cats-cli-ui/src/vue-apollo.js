import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
// import { WebSocketLink } from 'apollo-link-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'
// import clientStateDefaults from './state/defaults'
// import clientStateResolvers from './state/resolvers'
// import clientStateTypeDefs from './state/typeDefs'
// GraphQL documents
import LOADING_CHANGE from '@/graphql/loading/loadingChange.gql'

// Install the vue plugi
Vue.use(VueApollo)

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:4000/graphql'
})

// Create the subscription websocket link
// const wsLink = new WebSocketLink({
//   uri: 'ws://localhost:4000/graphql',
//   options: {
//     reconnect: true
//   }
// })
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql'
    // options: {
    //   reconnect: true
    //   // lazy: true
    // }
  })
)
console.log(wsLink)
const link = split(
  // split based on operation type
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

  // const { data: { projectCurrent } } = await apolloClient.query({
  //   query: PROJECT_CURRENT,
  //   fetchPolicy: 'network-only'
  // })
  // const projectId = projectCurrent.id

  // if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    // await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }

  // await apolloClient.mutate({
  //   mutation: CURRENT_PROJECT_ID_SET,
  //   variables: {
  //     projectId
  //   }
  // })
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
