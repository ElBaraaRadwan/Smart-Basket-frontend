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
