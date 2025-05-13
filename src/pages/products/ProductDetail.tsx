import React from "react";
import { useParams } from "react-router-dom";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  // TODO: Implement product fetching logic
  const product = {
    id,
    name: "",
    price: 0,
    description: "",
    images: [],
    stock: 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((image, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1">
                <img
                  src={image}
                  alt={`${product.name} ${index + 2}`}
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold">${product.price}</p>
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Stock: {product.stock} units available
            </p>
            <button
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => {
                // TODO: Implement add to cart logic
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
