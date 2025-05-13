import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CART } from "../../graphql/queries";
import { UPDATE_CART_ITEM, REMOVE_FROM_CART } from "../../graphql/mutations";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { Toast, ToastTitle, ToastDescription } from "../../components/ui/Toast";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState({ title: "", message: "" });

  // Get cart data
  const { loading, error, data } = useQuery(GET_CART, {
    fetchPolicy: "cache-and-network",
    skip: !isAuthenticated,
  });

  // Update cart item mutation
  const [updateCartItem, { loading: updatingCart }] = useMutation(UPDATE_CART_ITEM, {
    onError: (error) => {
      setToastMessage({
        title: "Error",
        message: error.message || "Failed to update cart",
      });
      setShowToast(true);
    },
  });

  // Remove from cart mutation
  const [removeFromCart, { loading: removingFromCart }] = useMutation(REMOVE_FROM_CART, {
    onError: (error) => {
      setToastMessage({
        title: "Error",
        message: error.message || "Failed to remove item from cart",
      });
      setShowToast(true);
    },
  });

  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    updateCartItem({
      variables: {
        input: {
          cartItemId: itemId,
          quantity,
        },
      },
    });
  };

  // Handle remove item
  const handleRemoveItem = (itemId: string) => {
    removeFromCart({
      variables: {
        input: {
          cartItemId: itemId,
        },
      },
    });
  };

  // Proceed to checkout
  const handleCheckout = () => {
    navigate("/checkout");
  };

  // Check if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your cart</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your cart and continue shopping.
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
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          <p>Error loading cart: {error.message}</p>
        </div>
        <div className="text-center">
          <Button onClick={() => navigate("/products")} variant="outline">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const cart = data?.cart;
  const cartItems = cart?.items || [];
  const cartTotal = cart?.totalAmount || 0;
  const cartItemCount = cart?.totalItems || 0;

  // Empty cart state
  if (!cart || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button onClick={() => navigate("/products")} className="w-full">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-gray-50 py-3 px-4 hidden md:grid md:grid-cols-12 text-sm font-medium text-gray-500">
              <div className="md:col-span-6">Product</div>
              <div className="md:col-span-2 text-center">Price</div>
              <div className="md:col-span-2 text-center">Quantity</div>
              <div className="md:col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 px-4">
                  <div className="md:grid md:grid-cols-12 md:gap-4 space-y-4 md:space-y-0">
                    {/* Product */}
                    <div className="md:col-span-6 flex space-x-4">
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                        <img
                          src={item.product.imageUrl || "https://placehold.co/200x200/e5e7eb/a3a3a3?text=Product"}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          <Link to={`/products/${item.product.id}`}>
                            {item.product.name}
                          </Link>
                        </h3>
                        {item.variant && (
                          <p className="mt-1 text-sm text-gray-500">
                            {item.variant.name}
                          </p>
                        )}
                        <button
                          type="button"
                          className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 md:hidden"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingFromCart}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 flex justify-between md:block">
                      <div className="md:hidden text-sm font-medium text-gray-500">Price</div>
                      <div className="text-sm font-medium text-gray-900 md:text-center">
                        ${item.product.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex justify-between md:block">
                      <div className="md:hidden text-sm font-medium text-gray-500">Quantity</div>
                      <div className="flex items-center justify-center">
                        <div className="flex border border-gray-300 rounded-md">
                          <button
                            type="button"
                            className="p-1 px-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingCart}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300 w-10 text-center">
                            {updatingCart ? "..." : item.quantity}
                          </span>
                          <button
                            type="button"
                            className="p-1 px-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updatingCart}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 flex justify-between md:block">
                      <div className="md:hidden text-sm font-medium text-gray-500">Total</div>
                      <div className="flex items-center justify-end">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 hidden md:block"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingFromCart}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <dl className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <dt>Subtotal ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})</dt>
                <dd className="font-medium">${cartTotal.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between text-sm">
                <dt>Shipping</dt>
                <dd className="font-medium">Calculated at checkout</dd>
              </div>

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-base font-medium">
                  <dt>Order total</dt>
                  <dd>${cartTotal.toFixed(2)}</dd>
                </div>
              </div>
            </dl>

            <Button
              onClick={handleCheckout}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Secure checkout with 128-bit SSL encryption
            </p>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <Toast onClose={() => setShowToast(false)}>
          <ToastTitle>{toastMessage.title}</ToastTitle>
          <ToastDescription>{toastMessage.message}</ToastDescription>
        </Toast>
      )}
    </div>
  );
};

export default Cart;
