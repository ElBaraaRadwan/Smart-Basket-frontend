import React, { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toast } from "../../components/ui/Toast";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variantName?: string;
  variantId?: string;
  imageUrl?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

// Mock data - Replace with actual API call
const getMockOrders = (): Order[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    _id: `order-${i + 1}`,
    orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
    customerId: `customer-${i + 1}`,
    customerName: `Customer ${i + 1}`,
    customerEmail: `customer${i + 1}@example.com`,
    items: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, j) => ({
        productId: `product-${j + 1}`,
        productName: `Product ${j + 1}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: Math.floor(Math.random() * 100) + 10,
        imageUrl: `https://via.placeholder.com/50`,
      })
    ),
    total: Math.floor(Math.random() * 500) + 50,
    status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"][
      Math.floor(Math.random() * 4)
    ] as Order["status"],
    shippingAddress: {
      street: "123 Main St",
      city: "Anytown",
      state: "ST",
      zipCode: "12345",
      country: "USA",
    },
    paymentStatus: ["PENDING", "PAID", "FAILED"][
      Math.floor(Math.random() * 3)
    ] as Order["paymentStatus"],
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ),
    updatedAt: new Date(),
  }));
};

const StoreOrders: React.FC = () => {
  const { user } = useAuth();
  const { store } = useStore(user?.id || "");
  const [orders, setOrders] = useState<Order[]>(getMockOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "ALL">(
    "ALL"
  );

  // WebSocket setup
  const handleWebSocketMessage = (message: { type: string; payload: any }) => {
    switch (message.type) {
      case "NEW_ORDER":
        const newOrder = message.payload as Order;
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
        toast({
          title: "New Order Received",
          description: `Order #${newOrder.orderNumber} has been placed.`,
          variant: "default",
        });
        break;

      case "ORDER_STATUS_UPDATED":
        const updatedOrder = message.payload as Order;
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
        if (selectedOrder?._id === updatedOrder._id) {
          setSelectedOrder(updatedOrder);
        }
        toast({
          title: "Order Status Updated",
          description: `Order #${updatedOrder.orderNumber} is now ${updatedOrder.status}`,
          variant: "default",
        });
        break;

      case "ORDER_PAYMENT_UPDATED":
        const orderWithUpdatedPayment = message.payload as Order;
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderWithUpdatedPayment._id
              ? orderWithUpdatedPayment
              : order
          )
        );
        if (selectedOrder?._id === orderWithUpdatedPayment._id) {
          setSelectedOrder(orderWithUpdatedPayment);
        }
        toast({
          title: "Payment Status Updated",
          description: `Payment for order #${orderWithUpdatedPayment.orderNumber} is ${orderWithUpdatedPayment.paymentStatus}`,
          variant:
            orderWithUpdatedPayment.paymentStatus === "PAID"
              ? "default"
              : "destructive",
        });
        break;
    }
  };

  const { sendMessage } = useWebSocket(
    `ws://localhost:3000/ws/store/${store?._id}`,
    handleWebSocketMessage
  );

  // Function to update order status
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      // Send status update through WebSocket
      sendMessage({
        type: "UPDATE_ORDER_STATUS",
        payload: {
          orderId,
          status: newStatus,
        },
      });

      // Optimistically update the UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

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
              setFilterStatus(e.target.value as Order["status"] | "ALL")
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
                      handleStatusUpdate(
                        selectedOrder._id,
                        e.target.value as Order["status"]
                      )
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

export default StoreOrders;
