import { ApplicationConfig, inject } from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { environment } from '../../../environments/environment';

// Error handling link - use any type as Apollo client types vary by version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorLink = onError((errorResponse: any) => {
  if (errorResponse.graphQLErrors) {
    errorResponse.graphQLErrors.forEach((err: { message: string; locations?: unknown; path?: unknown }) => {
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${JSON.stringify(err.locations)}, Path: ${err.path}`
      );
    });
  }
  if (errorResponse.networkError) {
    console.error(`[Network error]: ${errorResponse.networkError}`);
  }
});

export function provideGraphQL(): ApplicationConfig['providers'] {
  return [
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const http = httpLink.create({
        uri: environment.graphqlUrl,
      });

      return {
        link: ApolloLink.from([errorLink, http]),
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                products: {
                  merge(_existing = [], incoming: unknown[]) {
                    return incoming;
                  },
                },
                orders: {
                  merge(_existing = [], incoming: unknown[]) {
                    return incoming;
                  },
                },
                shipments: {
                  merge(_existing = [], incoming: unknown[]) {
                    return incoming;
                  },
                },
              },
            },
          },
        }),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
          },
          query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
          },
          mutate: {
            errorPolicy: 'all',
          },
        },
      };
    }),
  ];
}
