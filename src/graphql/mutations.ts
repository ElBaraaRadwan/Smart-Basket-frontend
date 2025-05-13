import { gql } from "@apollo/client";

export const UPDATE_CUSTOMER_STATUS = gql`
  mutation UpdateCustomerStatus($customerId: ID!, $status: CustomerStatus!) {
    updateCustomerStatus(customerId: $customerId, status: $status) {
      _id
      status
    }
  }
`;

export const UPDATE_CUSTOMER_NOTES = gql`
  mutation UpdateCustomerNotes($customerId: ID!, $notes: String!) {
    updateCustomerNotes(customerId: $customerId, notes: $notes) {
      _id
      notes
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      _id
      orderNumber
      status
      updatedAt
    }
  }
`;

// Auth mutations
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// Cart mutations
export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
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

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($input: RemoveFromCartInput!) {
    removeFromCart(input: $input) {
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

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
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

// Order mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
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
      createdAt
    }
  }
`;
