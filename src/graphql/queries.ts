import { gql } from "@apollo/client";

// Product queries
export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductsInput) {
    products(input: $input) {
      id
      name
      description
      price
      imageUrl
      category
      inStock
      attributes {
        name
        value
      }
      variants {
        id
        name
        price
      }
      createdAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      imageUrl
      category
      inStock
      attributes {
        name
        value
      }
      variants {
        id
        name
        price
      }
      reviews {
        id
        rating
        comment
        user {
          id
          firstName
          lastName
        }
        createdAt
      }
    }
  }
`;

// Cart queries
export const GET_CART = gql`
  query GetCart {
    cart {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
        }
      }
      totalItems
      totalAmount
    }
  }
`;

// Order queries
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      orderNumber
      status
      totalAmount
      createdAt
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      status
      totalAmount
      items {
        id
        quantity
        price
        product {
          id
          name
          imageUrl
        }
      }
      shippingAddress {
        fullName
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
      }
      paymentMethod
      createdAt
    }
  }
`;

// User profile
export const GET_PROFILE = gql`
  query GetProfile {
    me {
      id
      email
      firstName
      lastName
      role
      addresses {
        id
        fullName
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        isDefault
      }
    }
  }
`;
