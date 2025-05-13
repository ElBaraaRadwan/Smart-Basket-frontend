import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "../graphql/queries";

const Home: React.FC = () => {
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { input: { limit: 4, featured: true } },
  });

  const categories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://placehold.co/300x200/e5e7eb/a3a3a3?text=Electronics",
      slug: "electronics",
    },
    {
      id: 2,
      name: "Clothing",
      image: "https://placehold.co/300x200/e5e7eb/a3a3a3?text=Clothing",
      slug: "clothing",
    },
    {
      id: 3,
      name: "Home & Kitchen",
      image: "https://placehold.co/300x200/e5e7eb/a3a3a3?text=Home",
      slug: "home-kitchen",
    },
    {
      id: 4,
      name: "Beauty",
      image: "https://placehold.co/300x200/e5e7eb/a3a3a3?text=Beauty",
      slug: "beauty",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-8 mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Smart-baskt</h1>
        <p className="text-xl mb-6">Your one-stop shop for all your needs.</p>
        <Link
          to="/products"
          className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
      </div>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden transition-all group-hover:shadow-md">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-blue-600 group-hover:underline mt-1">
                    View Products →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">
            Error loading products: {error.message}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products?.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm transition-all group-hover:shadow-md">
                  <img
                    src={
                      product.imageUrl ||
                      "https://placehold.co/300x300/e5e7eb/a3a3a3?text=Product"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
