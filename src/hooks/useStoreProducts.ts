import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

interface StoreProduct {
  _id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  category: string[];
  variants?: {
    name: string;
    options: string[];
  }[];
  attributes?: {
    name: string;
    value: string;
  }[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  createdAt: Date;
  updatedAt: Date;
}

interface ProductFilter {
  storeId: string;
  status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  category?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

const GET_STORE_PRODUCTS = gql`
  query GetStoreProducts($filter: ProductFilterInput!) {
    storeProducts(filter: $filter) {
      _id
      storeId
      name
      description
      price
      salePrice
      stock
      images
      category
      variants {
        name
        options
      }
      attributes {
        name
        value
      }
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      _id
      name
      description
      price
      stock
      status
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      _id
      name
      description
      price
      salePrice
      stock
      status
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      _id
      success
    }
  }
`;

const UPDATE_PRODUCT_STATUS = gql`
  mutation UpdateProductStatus($id: ID!, $status: ProductStatus!) {
    updateProductStatus(id: $id, status: $status) {
      _id
      status
    }
  }
`;

export function useStoreProducts(filter: ProductFilter) {
  const { data, loading, error, refetch } = useQuery(GET_STORE_PRODUCTS, {
    variables: { filter },
  });

  return {
    products: data?.storeProducts as StoreProduct[],
    loading,
    error,
    refetch,
  };
}

export function useStoreProductMutations() {
  const [createProductMutation] = useMutation(CREATE_PRODUCT);
  const [updateProductMutation] = useMutation(UPDATE_PRODUCT);
  const [deleteProductMutation] = useMutation(DELETE_PRODUCT);
  const [updateProductStatusMutation] = useMutation(UPDATE_PRODUCT_STATUS);

  const createProduct = async (input: {
    storeId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images?: string[];
    category?: string[];
    variants?: {
      name: string;
      options: string[];
    }[];
    attributes?: {
      name: string;
      value: string;
    }[];
  }) => {
    const { data } = await createProductMutation({
      variables: { input },
    });
    return data.createProduct;
  };

  const updateProduct = async (
    id: string,
    input: {
      name?: string;
      description?: string;
      price?: number;
      salePrice?: number;
      stock?: number;
      images?: string[];
      category?: string[];
      variants?: {
        name: string;
        options: string[];
      }[];
      attributes?: {
        name: string;
        value: string;
      }[];
    }
  ) => {
    const { data } = await updateProductMutation({
      variables: { id, input },
    });
    return data.updateProduct;
  };

  const deleteProduct = async (id: string) => {
    const { data } = await deleteProductMutation({
      variables: { id },
    });
    return data.deleteProduct;
  };

  const updateProductStatus = async (
    id: string,
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  ) => {
    const { data } = await updateProductStatusMutation({
      variables: { id, status },
    });
    return data.updateProductStatus;
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
  };
}
