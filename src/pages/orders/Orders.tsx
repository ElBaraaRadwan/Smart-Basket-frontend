import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "../../graphql/queries";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";

// Order status options and colors
const ORDER_STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  // Get orders from API
  const { loading, error, data } = useQuery(GET_ORDERS, {
    fetchPolicy: "cache-and-network",
    skip: !isAuthenticated,
  });

  // Handle period filter change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Filter orders based on selected period
  const getFilteredOrders = () => {
    if (!data?.orders) return [];

    const orders = data.orders;

    if (selectedPeriod === "all") {
      return orders;
    }

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "3months":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "6months":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      default:
        return orders;
    }

    return orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
    });
  };

  // Check if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your orders</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your order history.
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="w-full"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between">
                  <div className="w-32 h-6 bg-gray-200 rounded"></div>
                  <div className="w-32 h-6 bg-gray-200 rounded"></div>
                  <div className="w-32 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          <p>Error loading orders: {error.message}</p>
        </div>
        <div className="text-center">
          <Button onClick={() => navigate("/products")} variant="outline">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  // Empty state - no orders
  if (filteredOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-gray-500">
            {selectedPeriod !== "all"
              ? "Try selecting a different time period"
              : "You haven't placed any orders yet"}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate("/products")}>
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {/* Time period filter */}
      <div className="bg-white p-4 rounded-lg border mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "all"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handlePeriodChange("all")}
          >
            All Orders
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "30days"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handlePeriodChange("30days")}
          >
            Last 30 Days
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "3months"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handlePeriodChange("3months")}
          >
            Past 3 Months
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "6months"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handlePeriodChange("6months")}
          >
            Past 6 Months
          </button>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-6">
        {filteredOrders.map((order: any) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Order #{order.orderNumber}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-medium">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-6 mb-6">
                {order.items.slice(0, 2).map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                      <img
                        src={item.product.imageUrl || "https://placehold.co/200x200/e5e7eb/a3a3a3?text=Product"}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium">
                        <Link to={`/products/${item.product.id}`}>
                          {item.product.name}
                        </Link>
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <p>Qty: {item.quantity}</p>
                        <p>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {order.items.length > 2 && (
                  <p className="text-sm text-gray-500">
                    +{order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  variant="outline"
                  size="sm"
                >
                  View Order Details
                </Button>

                {order.status === "DELIVERED" && (
                  <Button
                    onClick={() => navigate(`/products/${order.items[0].product.id}/review`)}
                    variant="outline"
                    size="sm"
                  >
                    Write a Review
                  </Button>
                )}

                {order.status === "PENDING" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {/* Add cancel logic */}}
                  >
                    Cancel Order
                  </Button>
                )}

                {["DELIVERED", "SHIPPED"].includes(order.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Add track order logic */}}
                  >
                    Track Package
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
