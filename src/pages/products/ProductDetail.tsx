import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCT } from "../../graphql/queries";
import { ADD_TO_CART } from "../../graphql/mutations";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { Toast, ToastTitle, ToastDescription } from "../../components/ui/Toast";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // State for product options
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", message: "" });
  const [activeImage, setActiveImage] = useState(0);

  // Get product details
  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  // Add to cart mutation
  const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      setToastMessage({
        title: "Success",
        message: "Product added to cart!",
      });
      setShowToast(true);
    },
    onError: (error) => {
      setToastMessage({
        title: "Error",
        message: error.message || "Failed to add product to cart",
      });
      setShowToast(true);
    },
  });

  // Get current product variant price
  const getPrice = () => {
    if (!data?.product) return 0;

    if (selectedVariant && data.product.variants) {
      const variant = data.product.variants.find((v: any) => v.id === selectedVariant);
      if (variant) return variant.price;
    }

    return data.product.price;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setToastMessage({
        title: "Authentication Required",
        message: "Please log in to add items to your cart",
      });
      setShowToast(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    addToCart({
      variables: {
        input: {
          productId: id,
          quantity,
          variantId: selectedVariant || undefined,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>Error loading product: {error.message}</p>
          <Link to="/products" className="text-blue-600 underline mt-2 inline-block">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="text-blue-600 underline mt-4 inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const product = data.product;
  const images = product.imageUrl ? [product.imageUrl] : [];
  if (product.images) {
    images.push(...product.images);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/products" className="text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg border">
            <img
              src={images[activeImage] || "https://placehold.co/600x600/e5e7eb/a3a3a3?text=No+Image"}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-md border ${
                    activeImage === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{product.category}</p>
          </div>

          <div className="text-2xl font-semibold">${getPrice().toFixed(2)}</div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-4 py-2 border rounded-md text-sm ${
                      selectedVariant === variant.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {variant.name}
                    {variant.price !== product.price && ` (+$${(variant.price - product.price).toFixed(2)})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium mb-2">Product Details</h3>
              <dl className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                {product.attributes.map((attr: any, idx: number) => (
                  <div key={idx} className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{attr.name}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Add to cart */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-3">Quantity:</span>
              <div className="flex border border-gray-300 rounded-md">
                <button
                  type="button"
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">
                Status:{" "}
                <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </p>

              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || addingToCart}
                className="w-full"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-2">
                  {/* Star Rating */}
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < review.rating ? "currentColor" : "none"}
                        stroke={i < review.rating ? "none" : "currentColor"}
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>

                  <span className="font-medium">
                    {review.user.firstName} {review.user.lastName}
                  </span>

                  <span className="text-gray-500 text-sm ml-auto">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default ProductDetail;
