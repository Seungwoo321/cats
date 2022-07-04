// for Apollo Client v3 older than v3.5.10:
import {
  ApolloLink,
  Observable
} from '@apollo/client/core'
// or for Apollo Client v2:
// import { ApolloLink, Operation, FetchResult, Observable } from 'apollo-link'; // yarn add apollo-link

import { print } from 'graphql'
// import { createClient, Client } from 'graphql-ws'

export class GraphQLWsLink extends ApolloLink {
  constructor (client) {
    console.log(client)
    super()
  }

  request (operation) {
    return new Observable((sink) => {
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink)
        }
      )
    })
  }
}
