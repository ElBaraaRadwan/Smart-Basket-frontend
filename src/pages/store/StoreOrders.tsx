import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toast } from "../../components/ui/Toast";
import { useQuery, useMutation } from "@apollo/client";
import { GET_STORE_ORDERS } from "../../graphql/queries";
import { UPDATE_ORDER_STATUS } from "../../graphql/mutations";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import {
  Order,
  OrderStatus,
  WebSocketOrderMessage,
  GetStoreOrdersQuery,
  UpdateOrderStatusMutation,
} from "../../types/graphql";

const StoreOrders: React.FC = () => {
  const { user } = useAuth();
  const { store } = useStore(user?.id || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");

  // GraphQL Query
  const { data, loading, error } = useQuery<GetStoreOrdersQuery>(
    GET_STORE_ORDERS,
    {
      variables: { storeId: store?._id },
      skip: !store?._id,
    }
  );

  // GraphQL Mutation
  const [updateOrderStatus] = useMutation<UpdateOrderStatusMutation>(
    UPDATE_ORDER_STATUS,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Order status updated successfully",
          variant: "default",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  // WebSocket setup
  const { isConnected } = useWebSocket<WebSocketOrderMessage>(
    `/store/${store?._id}`,
    (message) => {
      switch (message.type) {
        case "NEW_ORDER":
          toast({
            title: "New Order Received",
            description: `Order #${message.payload.orderNumber} has been placed.`,
            variant: "default",
          });
          break;

        case "ORDER_STATUS_UPDATED":
          if (selectedOrder?._id === message.payload._id) {
            setSelectedOrder(message.payload);
          }
          toast({
            title: "Order Status Updated",
            description: `Order #${message.payload.orderNumber} is now ${message.payload.status}`,
            variant: "default",
          });
          break;

        case "ORDER_PAYMENT_UPDATED":
          if (selectedOrder?._id === message.payload._id) {
            setSelectedOrder(message.payload);
          }
          toast({
            title: "Payment Status Updated",
            description: `Payment for order #${message.payload.orderNumber} is ${message.payload.paymentStatus}`,
            variant:
              message.payload.paymentStatus === "PAID"
                ? "default"
                : "destructive",
          });
          break;
      }
    },
    {
      onError: () => {
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time updates",
          variant: "destructive",
        });
      },
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) {
    toast({
      title: "WebSocket Disconnected",
      description: "Real-time updates are currently unavailable",
      variant: "destructive",
    });
  }

  const orders = data?.storeOrders || [];
  const filteredOrders = orders.filter(
    (order) => filterStatus === "ALL" || order.status === filterStatus
  );

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as OrderStatus | "ALL")
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items.length} items
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    Order {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-gray-500">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium">Customer Information</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{selectedOrder.customerName}</p>
                    <p>{selectedOrder.customerEmail}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Order Items</h3>
                  <div className="mt-2 space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-gray-500">
                                {item.variantName}
                              </p>
                            )}
                            <p className="text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Update Order Status</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      updateOrderStatus({
                        variables: {
                          orderId: selectedOrder._id,
                          status: e.target.value as Order["status"],
                        },
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StoreOrdersWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <StoreOrders />
    </ErrorBoundary>
  );
}
