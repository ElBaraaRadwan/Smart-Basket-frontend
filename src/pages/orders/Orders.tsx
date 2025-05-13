import React from "react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
    };
  }[];
}

const Orders: React.FC = () => {
  // TODO: Implement order fetching logic
  const orders: Order[] = [];

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">No orders found</h2>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-500">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border overflow-hidden"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Order placed</p>
                  <p className="font-medium">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{order.status}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-20 h-20">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="text-lg font-medium hover:text-indigo-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
