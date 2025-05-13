import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { GET_STORE_ORDERS } from "../../../graphql/queries";
import { UPDATE_ORDER_STATUS } from "../../../graphql/mutations";
import StoreOrders from "../StoreOrders";
import { OrderStatus } from "../../../types/graphql";

const mockOrders = [
  {
    _id: "order-1",
    orderNumber: "ORD-1001",
    customerId: "customer-1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    items: [
      {
        productId: "product-1",
        productName: "Test Product",
        quantity: 2,
        price: 100,
      },
    ],
    total: 200,
    status: OrderStatus.PENDING,
    shippingAddress: {
      street: "123 Test St",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
      country: "Test Country",
    },
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mocks = [
  {
    request: {
      query: GET_STORE_ORDERS,
      variables: { storeId: "store-1" },
    },
    result: {
      data: {
        storeOrders: mockOrders,
      },
    },
  },
  {
    request: {
      query: UPDATE_ORDER_STATUS,
      variables: { orderId: "order-1", status: OrderStatus.PROCESSING },
    },
    result: {
      data: {
        updateOrderStatus: {
          _id: "order-1",
          orderNumber: "ORD-1001",
          status: OrderStatus.PROCESSING,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  },
];

// Mock the hooks
jest.mock("../../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
  }),
}));

jest.mock("../../../hooks/useStore", () => ({
  useStore: () => ({
    store: { _id: "store-1" },
  }),
}));

jest.mock("../../../hooks/useWebSocket", () => ({
  useWebSocket: () => ({
    isConnected: true,
    sendMessage: jest.fn(),
  }),
}));

describe("StoreOrders", () => {
  it("renders loading state", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <StoreOrders />
      </MockedProvider>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders orders after loading", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <StoreOrders />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    });
  });

  it("filters orders by status", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <StoreOrders />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole("combobox");
    fireEvent.change(filterSelect, {
      target: { value: OrderStatus.PROCESSING },
    });

    expect(screen.queryByText("ORD-1001")).not.toBeInTheDocument();
  });

  it("updates order status", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <StoreOrders />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    });

    // Click on the order to open modal
    fireEvent.click(screen.getByText("ORD-1001"));

    // Change status
    const statusSelect = screen.getByRole("combobox", {
      name: /update order status/i,
    });
    fireEvent.change(statusSelect, {
      target: { value: OrderStatus.PROCESSING },
    });

    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
  });
});
