import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import config from "../config/environment";

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link to your GraphQL API
const httpLink = new HttpLink({
  uri: config.API_URL,
  credentials: "include",
});

// Token link factory - to add auth token when available
const createAuthLink = (getToken: () => string | null): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    const token = getToken();
    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    }
    return forward(operation);
  });
};

// Create the Apollo Client instance
export const createApolloClient = (getToken = () => null) => {
  return new ApolloClient({
    link: from([errorLink, createAuthLink(getToken), httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};

// Default client without auth
export const apolloClient = createApolloClient();
