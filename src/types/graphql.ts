export type Maybe<T> = T | null;

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variantName?: Maybe<string>;
  variantId?: Maybe<string>;
  imageUrl?: Maybe<string>;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum CustomerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
  status: CustomerStatus;
  tags: string[];
  notes?: Maybe<string>;
  orders: Order[];
}

export interface GetStoreCustomersQuery {
  storeCustomers: Customer[];
}

export interface GetStoreOrdersQuery {
  storeOrders: Order[];
}

export interface UpdateCustomerStatusMutation {
  updateCustomerStatus: Pick<Customer, "_id" | "status">;
}

export interface UpdateCustomerNotesMutation {
  updateCustomerNotes: Pick<Customer, "_id" | "notes">;
}

export interface UpdateOrderStatusMutation {
  updateOrderStatus: Pick<
    Order,
    "_id" | "orderNumber" | "status" | "updatedAt"
  >;
}

export interface WebSocketOrderMessage {
  type: "NEW_ORDER" | "ORDER_STATUS_UPDATED" | "ORDER_PAYMENT_UPDATED";
  payload: Order;
}
