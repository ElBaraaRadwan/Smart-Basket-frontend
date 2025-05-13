import React from "react";
import { useStore } from "../../hooks/useStore";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const StoreDashboard: React.FC = () => {
  const { user } = useAuth();
  const { store, loading } = useStore(user?.id || "");

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Store Dashboard</h1>
        <Link
          to="/store/manage"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Store
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Products</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Rating</h3>
          <p className="text-2xl font-bold">{store?.rating || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          <div className="p-4">
            <div className="text-center text-gray-500 py-4">No orders yet</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Reviews</h2>
          </div>
          <div className="p-4">
            <div className="text-center text-gray-500 py-4">No reviews yet</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/store/products"
                className="flex items-center justify-center p-4 border rounded hover:bg-gray-50"
              >
                Manage Products
              </Link>
              <Link
                to="/store/orders"
                className="flex items-center justify-center p-4 border rounded hover:bg-gray-50"
              >
                View Orders
              </Link>
              <Link
                to="/store/settings"
                className="flex items-center justify-center p-4 border rounded hover:bg-gray-50"
              >
                Store Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
