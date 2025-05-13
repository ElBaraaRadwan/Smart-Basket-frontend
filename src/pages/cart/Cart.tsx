import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";

const Cart: React.FC = () => {
  const { cart, updateCartItem, removeFromCart } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-500">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 border rounded-lg p-4"
              >
                <div className="w-24 h-24">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">${item.product.price}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() =>
                        updateCartItem(item.id, Math.max(0, item.quantity - 1))
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cart.total}</span>
            </div>
            <div className="border-t pt-4">
              <Link
                to="/checkout"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 inline-block text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
