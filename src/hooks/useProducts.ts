import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface ProductAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: ProductAttribute[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryIds: string[];
  imageUrls: string[];
  averageRating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  brand?: string;
  isActive: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  isFeatured: boolean;
  weight: number;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
  taxRate?: number;
  minOrderQuantity?: number;
}

interface ProductFilter {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  brand?: string;
}

const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilterInput) {
    products(filter: $filter) {
      _id
      name
      description
      price
      salePrice
      categoryIds
      imageUrls
      averageRating
      reviewCount
      stock
      sku
      brand
      isActive
      attributes {
        name
        value
      }
      variants {
        _id
        sku
        price
        stock
        attributes {
          name
          value
        }
      }
      isFeatured
      weight
      unit
      createdAt
      updatedAt
      taxRate
      minOrderQuantity
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      _id
      name
      description
      price
      salePrice
      categoryIds
      imageUrls
      averageRating
      reviewCount
      stock
      sku
      brand
      isActive
      attributes {
        name
        value
      }
      variants {
        _id
        sku
        price
        stock
        attributes {
          name
          value
        }
      }
      isFeatured
      weight
      unit
      createdAt
      updatedAt
      taxRate
      minOrderQuantity
    }
  }
`;

export function useProducts(filter?: ProductFilter) {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { filter },
  });

  return {
    products: data?.products as Product[],
    loading,
    error,
  };
}

export function useProduct(id: string) {
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
  });

  return {
    product: data?.product as Product,
    loading,
    error,
  };
}
