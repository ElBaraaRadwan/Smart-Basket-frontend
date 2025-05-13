import React from "react";
import { useStore } from "../../hooks/useStore";
import { useAuth } from "../../hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  revenue: {
    daily: { date: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    total: number;
  };
  orders: {
    daily: { date: string; count: number }[];
    monthly: { month: string; count: number }[];
    total: number;
    pending: number;
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number;
  };
  topProducts: {
    name: string;
    sales: number;
    revenue: number;
  }[];
  customerMetrics: {
    total: number;
    new: number;
    returning: number;
  };
}

// Mock data - Replace with actual API call
const getMockAnalyticsData = (): AnalyticsData => ({
  revenue: {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      amount: Math.floor(Math.random() * 1000),
    })).reverse(),
    monthly: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(
        Date.now() - i * 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", { month: "short" }),
      amount: Math.floor(Math.random() * 5000),
    })).reverse(),
    total: 25000,
  },
  orders: {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      count: Math.floor(Math.random() * 20),
    })).reverse(),
    monthly: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(
        Date.now() - i * 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", { month: "short" }),
      count: Math.floor(Math.random() * 100),
    })).reverse(),
    total: 150,
    pending: 12,
  },
  products: {
    total: 45,
    outOfStock: 5,
    lowStock: 8,
  },
  topProducts: Array.from({ length: 5 }, (_, i) => ({
    name: `Product ${i + 1}`,
    sales: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 2000),
  })),
  customerMetrics: {
    total: 200,
    new: 15,
    returning: 185,
  },
});

const StoreAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { store } = useStore(user?.id || "");
  const analyticsData = getMockAnalyticsData();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Store Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">${analyticsData.revenue.total}</p>
          <span className="text-green-500 text-sm">+12% from last month</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{analyticsData.orders.total}</p>
          <span className="text-gray-500 text-sm">
            {analyticsData.orders.pending} pending
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Products</h3>
          <p className="text-2xl font-bold">{analyticsData.products.total}</p>
          <span className="text-red-500 text-sm">
            {analyticsData.products.outOfStock} out of stock
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Customers</h3>
          <p className="text-2xl font-bold">
            {analyticsData.customerMetrics.total}
          </p>
          <span className="text-green-500 text-sm">
            {analyticsData.customerMetrics.new} new this month
          </span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.revenue.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4F46E5"
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Orders Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.orders.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
                <p className="font-medium">${product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Customer Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-gray-500">Total Customers</h3>
            <p className="text-2xl font-bold">
              {analyticsData.customerMetrics.total}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-gray-500">New Customers</h3>
            <p className="text-2xl font-bold">
              {analyticsData.customerMetrics.new}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-gray-500">Returning Customers</h3>
            <p className="text-2xl font-bold">
              {analyticsData.customerMetrics.returning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAnalytics;
