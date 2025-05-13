import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StoreProducts from "./pages/store/StoreProducts";
import StoreOrders from "./pages/store/StoreOrders";
import StoreAnalytics from "./pages/store/StoreAnalytics";
import StoreManagement from "./pages/store/StoreManagement";
import { useAuth } from "./hooks/useAuth";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Products = lazy(() => import("./pages/products/Products"));
const ProductDetail = lazy(() => import("./pages/products/ProductDetail"));
const Cart = lazy(() => import("./pages/cart/Cart"));
const Checkout = lazy(() => import("./pages/checkout/Checkout"));
const Orders = lazy(() => import("./pages/orders/Orders"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Wishlist = lazy(() => import("./pages/wishlist/Wishlist"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const StoreDashboard = lazy(() => import("./pages/store/StoreDashboard"));

const StoreOwnerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.isStoreOwner) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/store" replace />} />

      {/* Protected store routes */}
      <Route
        path="/store"
        element={
          <StoreOwnerRoute>
            <Outlet />
          </StoreOwnerRoute>
        }
      >
        <Route index element={<StoreDashboard />} />
        <Route path="manage" element={<StoreManagement />} />
        <Route path="products" element={<StoreProducts />} />
      </Route>
      <Route
        path="/store/orders"
        element={
          <StoreOwnerRoute>
            <StoreOrders />
          </StoreOwnerRoute>
        }
      />
      <Route
        path="/store/analytics"
        element={
          <StoreOwnerRoute>
            <StoreAnalytics />
          </StoreOwnerRoute>
        }
      />
    </Routes>
  );
};

export const routes: RouteObject[] = [
  {
    element: (
      <AuthWrapper>
        <Outlet />
      </AuthWrapper>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "products",
        children: [
          { index: true, element: <Products /> },
          { path: ":id", element: <ProductDetail /> },
        ],
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "wishlist",
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProducts /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "users", element: <AdminUsers /> },
        ],
      },
    ],
  },
];

export default AppRoutes;
