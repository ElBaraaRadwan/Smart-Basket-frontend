import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { useAuth } from "../../hooks/useAuth";

interface CustomerOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  createdAt: Date;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  tags: string[];
  notes?: string;
  orders: CustomerOrder[];
}

// Mock data - Replace with actual API call
const getMockCustomers = (): Customer[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    _id: `customer-${i + 1}`,
    firstName: `John${i + 1}`,
    lastName: `Doe${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phoneNumber: `+1234567890${i}`,
    totalOrders: Math.floor(Math.random() * 20) + 1,
    totalSpent: Math.floor(Math.random() * 2000) + 100,
    lastOrderDate: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ),
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
    ),
    status: ["ACTIVE", "INACTIVE", "BLOCKED"][
      Math.floor(Math.random() * 3)
    ] as Customer["status"],
    tags: ["Regular", "Premium", "New"][Math.floor(Math.random() * 3)].split(
      ","
    ),
    notes: Math.random() > 0.5 ? "VIP customer" : undefined,
    orders: Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, j) => ({
        _id: `order-${i}-${j}`,
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
        total: Math.floor(Math.random() * 500) + 50,
        status: ["PENDING", "DELIVERED", "SHIPPED"][
          Math.floor(Math.random() * 3)
        ],
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ),
      })
    ),
  }));
};

const StoreCustomers: React.FC = () => {
  const { user } = useAuth();
  const { store } = useStore(user?.id || "");
  const [customers] = useState<Customer[]>(getMockCustomers());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Customer["status"] | "ALL">(
    "ALL"
  );
  const [editingNotes, setEditingNotes] = useState(false);
  const [newNote, setNewNote] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchTerm === "" ||
      `${customer.firstName} ${customer.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Customer["status"]) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-yellow-100 text-yellow-800",
      BLOCKED: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as Customer["status"] | "ALL")
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ALL">All Customers</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Order
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer._id}
                onClick={() => setSelectedCustomer(customer)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.totalOrders} orders
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${customer.totalSpent.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      customer.status
                    )}`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.lastOrderDate.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h2>
                  <p className="text-gray-500">
                    Customer since{" "}
                    {selectedCustomer.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Contact Information
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900">
                        {selectedCustomer.email}
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedCustomer.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Customer Stats
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900">
                        Total Orders: {selectedCustomer.totalOrders}
                      </p>
                      <p className="text-sm text-gray-900">
                        Total Spent: ${selectedCustomer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                  <div className="mt-2 flex gap-2">
                    {selectedCustomer.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <button
                      onClick={() => {
                        setEditingNotes(true);
                        setNewNote(selectedCustomer.notes || "");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </div>
                  {editingNotes ? (
                    <div className="mt-2">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNotes(false)}
                          className="text-sm text-gray-600 hover:text-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement notes update
                            setEditingNotes(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-900">
                      {selectedCustomer.notes || "No notes added"}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Recent Orders
                  </h3>
                  <div className="mt-2 space-y-4">
                    {selectedCustomer.orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${order.total.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Update Status
                  </h3>
                  <select
                    value={selectedCustomer.status}
                    onChange={(e) => {
                      // TODO: Implement status update
                      console.log("Update status:", e.target.value);
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreCustomers;
