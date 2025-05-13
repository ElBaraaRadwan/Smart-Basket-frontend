import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    stock: number;
  };
}

const Wishlist: React.FC = () => {
  // TODO: Implement wishlist fetching logic
  const wishlistItems: WishlistItem[] = [];
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-500">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border overflow-hidden"
          >
            <Link to={`/products/${item.product.id}`}>
              <div className="aspect-w-1 aspect-h-1 w-full">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link
                to={`/products/${item.product.id}`}
                className="text-lg font-medium hover:text-indigo-600"
              >
                {item.product.name}
              </Link>
              <p className="text-gray-600 mt-1">
                ${item.product.price.toFixed(2)}
              </p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => addToCart(item.product.id)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement remove from wishlist logic
                  }}
                  className="w-full text-gray-600 hover:text-gray-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
