import React from "react";
import { Link } from "react-router-dom";

const Products: React.FC = () => {
  // TODO: Implement product fetching logic
  const products = [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <Link to={`/products/${product.id}`}>
              <div className="aspect-w-1 aspect-h-1 w-full">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
