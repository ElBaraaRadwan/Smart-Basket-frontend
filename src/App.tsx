import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { RetryLink } from "@apollo/client/link/retry";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastProvider, ToastViewport } from "./components/ui/Toast";
import RootLayout from "./layouts/RootLayout";
import { routes } from "./routes";
import { Suspense } from "react";
import "./index.css";
import config from "./config/environment";
import { getAccessToken, handleTokenRefresh } from "./utils/auth";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Create the http link
const httpLink = createHttpLink({
  uri: config.API_URL,
});

// Retry link configuration
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      const doNotRetry = ["FORBIDDEN", "UNAUTHENTICATED", "BAD_USER_INPUT"];
      return !!error && !doNotRetry.includes(error.extensions?.code);
    },
  },
});

// Error handling link
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.error(
          `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`
        );

        if (err.extensions?.code === "UNAUTHENTICATED") {
          return new Observable((observer) => {
            handleTokenRefresh(client)
              .then((token) => {
                if (token) {
                  const oldHeaders = operation.getContext().headers;
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      authorization: `Bearer ${token}`,
                    },
                  });
                  forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  });
                } else {
                  observer.complete();
                }
              })
              .catch(() => {
                observer.complete();
              });
          });
        }
      }
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      if ("statusCode" in networkError && networkError.statusCode === 401) {
        handleTokenRefresh(client);
      }
    }
  }
);

// Auth link for JWT
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Apollo Client setup
const client = new ApolloClient({
  link: from([retryLink, errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          storeCustomers: {
            merge: false,
          },
          storeOrders: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
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

// Create router
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: routes,
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Suspense fallback={<div>Loading...</div>}>
          <ToastProvider>
            <RouterProvider router={router} />
            <ToastViewport />
          </ToastProvider>
        </Suspense>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
