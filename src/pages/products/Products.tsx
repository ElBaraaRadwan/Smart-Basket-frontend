import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "../../graphql/queries";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

interface ProductsInput {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}

// Filter categories for the sidebar
const categories = [
  { id: "all", name: "All Categories" },
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "home-kitchen", name: "Home & Kitchen" },
  { id: "beauty", name: "Beauty" },
  { id: "books", name: "Books" },
  { id: "toys", name: "Toys & Games" },
];

// Sort options
const sortOptions = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductsInput>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    sortBy: searchParams.get("sortBy") || "newest",
    limit: 12,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  });

  const [activeCategory, setActiveCategory] = useState(
    filters.category || "all"
  );
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 1000,
  });

  // Get products with filters
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { input: filters },
    fetchPolicy: "cache-and-network",
  });

  // Update search params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();

    if (filters.search) newParams.set("search", filters.search);
    if (filters.category) newParams.set("category", filters.category);
    if (filters.minPrice)
      newParams.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice)
      newParams.set("maxPrice", filters.maxPrice.toString());
    if (filters.sortBy) newParams.set("sortBy", filters.sortBy);
    if (filters.page && filters.page > 1)
      newParams.set("page", filters.page.toString());

    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // Apply search filter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      search: searchTerm,
      page: 1, // Reset to first page on new search
    });
  };

  // Apply category filter
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setFilters({
      ...filters,
      category: categoryId === "all" ? "" : categoryId,
      page: 1, // Reset to first page on category change
    });
  };

  // Apply price filter
  const handlePriceChange = () => {
    setFilters({
      ...filters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      page: 1, // Reset to first page on price change
    });
  };

  // Apply sort option
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      sortBy: e.target.value,
    });
  };

  // Change page
  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage,
    });
    // Scroll to top on page change
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Search */}
            <div className="mb-6">
              <form onSubmit={handleSearch}>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit" className="ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
              </form>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Categories</h3>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 ${
                        activeCategory === category.id
                          ? "bg-gray-100 font-medium"
                          : ""
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Price Range</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        min: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min={0}
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handlePriceChange}
                  className="w-full"
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Products header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold">
              {filters.category
                ? categories.find((c) => c.id === filters.category)?.name ||
                  "Products"
                : "All Products"}
            </h1>

            <div className="flex items-center mt-4 sm:mt-0">
              <label htmlFor="sort" className="mr-2 text-sm font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading state */}
          {loading && !data?.products && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">
              <p>Error loading products: {error.message}</p>
            </div>
          )}

          {/* Empty state */}
          {data?.products && data.products.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => setFilters({ limit: 12, page: 1 })}
                  variant="outline"
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          )}

          {/* Products grid */}
          {data?.products && data.products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.products.map((product: any) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <img
                        src={
                          product.imageUrl ||
                          "https://placehold.co/300x300/e5e7eb/a3a3a3?text=Product"
                        }
                        alt={product.name}
                        className="object-cover w-full h-64"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-600 mt-1">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.inStock ? (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex">
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={data.products.length < filters.limit!}
                    className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
