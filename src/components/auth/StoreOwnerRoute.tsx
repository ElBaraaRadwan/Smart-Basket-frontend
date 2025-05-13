import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const StoreOwnerRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "STORE_OWNER") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default StoreOwnerRoute;
