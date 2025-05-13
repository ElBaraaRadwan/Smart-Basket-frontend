import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variantName?: string;
  variantId?: string;
  imageUrl?: string;
}

interface PaymentInfo {
  method: string;
  status: PaymentStatus;
  transactionId?: string;
}

interface ShippingInfo {
  address: string;
  trackingNumber?: string;
  cost: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment: PaymentInfo;
  shipping: ShippingInfo;
  addressId?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

interface OrderFilter {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
}

const GET_ORDERS = gql`
  query GetOrders($filter: OrderFilterInput) {
    orders(filter: $filter) {
      _id
      orderNumber
      userId
      items {
        productId
        productName
        quantity
        price
        variantName
        variantId
        imageUrl
      }
      subtotal
      tax
      total
      status
      payment {
        method
        status
        transactionId
      }
      shipping {
        address
        trackingNumber
        cost
      }
      addressId
      createdAt
      updatedAt
      deliveredAt
    }
  }
`;

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      _id
      orderNumber
      userId
      items {
        productId
        productName
        quantity
        price
        variantName
        variantId
        imageUrl
      }
      subtotal
      tax
      total
      status
      payment {
        method
        status
        transactionId
      }
      shipping {
        address
        trackingNumber
        cost
      }
      addressId
      createdAt
      updatedAt
      deliveredAt
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      _id
      orderNumber
      status
      payment {
        status
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      _id
      status
    }
  }
`;

export function useOrders(filter?: OrderFilter) {
  const { data, loading, error } = useQuery(GET_ORDERS, {
    variables: { filter },
  });

  return {
    orders: data?.orders as Order[],
    loading,
    error,
  };
}

export function useOrder(id: string) {
  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id },
  });

  const [updateOrderStatusMutation] = useMutation(UPDATE_ORDER_STATUS);

  const updateOrderStatus = async (status: OrderStatus) => {
    await updateOrderStatusMutation({
      variables: { id, status },
    });
  };

  return {
    order: data?.order as Order,
    loading,
    error,
    updateOrderStatus,
  };
}

export function useCreateOrder() {
  const [createOrderMutation, { loading }] = useMutation(CREATE_ORDER);

  const createOrder = async (input: {
    items: { productId: string; quantity: number; variantId?: string }[];
    addressId: string;
    paymentMethod: string;
  }) => {
    const { data } = await createOrderMutation({
      variables: { input },
    });
    return data.createOrder;
  };

  return {
    createOrder,
    loading,
  };
}
