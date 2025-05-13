import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import {
  useStoreProducts,
  useStoreProductMutations,
} from "../../hooks/useStoreProducts";
import { useAuth } from "../../hooks/useAuth";
import ImageUpload from "../../components/ImageUpload";

interface Variant {
  name: string;
  options: string[];
}

interface Attribute {
  name: string;
  value: string;
}

const StoreProducts: React.FC = () => {
  const { user } = useAuth();
  const { store } = useStore(user?.id || "");
  const { products, loading, refetch } = useStoreProducts({
    storeId: store?._id || "",
  });
  const { createProduct, updateProduct, deleteProduct, updateProductStatus } =
    useStoreProductMutations();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: [],
    images: [] as string[],
    variants: [] as Variant[],
    attributes: [] as Attribute[],
  });

  const [newVariant, setNewVariant] = useState({ name: "", options: "" });
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });

  const addVariant = () => {
    if (newVariant.name && newVariant.options) {
      setFormData({
        ...formData,
        variants: [
          ...formData.variants,
          {
            name: newVariant.name,
            options: newVariant.options.split(",").map((opt) => opt.trim()),
          },
        ],
      });
      setNewVariant({ name: "", options: "" });
    }
  };

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, { ...newAttribute }],
      });
      setNewAttribute({ name: "", value: "" });
    }
  };

  const removeAttribute = (index: number) => {
    const newAttributes = [...formData.attributes];
    newAttributes.splice(index, 1);
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct, formData);
      } else {
        await createProduct({
          storeId: store?._id || "",
          ...formData,
        });
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: [],
        images: [],
        variants: [],
        attributes: [],
      });
      refetch();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        refetch();
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleStatusChange = async (
    productId: string,
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  ) => {
    try {
      await updateProductStatus(productId, status);
      refetch();
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setIsAddingProduct(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </div>

      {(isAddingProduct || editingProduct) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) =>
                  setFormData({ ...formData, images })
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Variants
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Variant name (e.g., Size)"
                    value={newVariant.name}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, name: e.target.value })
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Options (comma-separated)"
                    value={newVariant.options}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, options: e.target.value })
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div>
                      <span className="font-medium">{variant.name}: </span>
                      <span>{variant.options.join(", ")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Attributes
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Attribute name"
                    value={newAttribute.name}
                    onChange={(e) =>
                      setNewAttribute({ ...newAttribute, name: e.target.value })
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newAttribute.value}
                    onChange={(e) =>
                      setNewAttribute({
                        ...newAttribute,
                        value: e.target.value,
                      })
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                {formData.attributes.map((attribute, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div>
                      <span className="font-medium">{attribute.name}: </span>
                      <span>{attribute.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                }}
                className="text-gray-600 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products?.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={product.status}
                    onChange={(e) =>
                      handleStatusChange(
                        product._id,
                        e.target.value as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
                      )
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingProduct(product._id);
                      setFormData({
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        stock: product.stock,
                        category: product.category,
                        images: product.images,
                        variants: product.variants || [],
                        attributes: product.attributes || [],
                      });
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreProducts;
