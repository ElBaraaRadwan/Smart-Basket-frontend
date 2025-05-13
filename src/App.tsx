import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastProvider, ToastViewport } from "./components/ui/Toast";
import RootLayout from "./layouts/RootLayout";
import { routes } from "./routes";
import { Suspense } from "react";
import "./index.css";
import config from "./config/environment";

// Create the http link
const httpLink = createHttpLink({
  uri: config.API_URL,
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Handle token expiration or authentication errors
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }
});

// Auth link for JWT
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Apollo Client setup
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          storeCustomers: {
            merge: false, // Don't merge with existing data
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
    <ApolloProvider client={client}>
      <Suspense fallback={<div>Loading...</div>}>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastViewport />
        </ToastProvider>
      </Suspense>
    </ApolloProvider>
  );
}

export default App;
