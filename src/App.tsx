import { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import { routes } from "./routes";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./App.css";

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
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
