import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CART, GET_PROFILE } from "../../graphql/queries";
import { CREATE_ORDER } from "../../graphql/mutations";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { Toast, ToastTitle, ToastDescription } from "../../components/ui/Toast";

// Payment methods
const PAYMENT_METHODS = [
  { id: "credit-card", name: "Credit Card", description: "Pay with credit card" },
  { id: "paypal", name: "PayPal", description: "Pay with PayPal" },
];

// Shipping methods
const SHIPPING_METHODS = [
  { id: "standard", name: "Standard Shipping", price: 5.99, eta: "3-5 business days" },
  { id: "express", name: "Express Shipping", price: 14.99, eta: "1-2 business days" },
  { id: "pickup", name: "Local Pickup", price: 0, eta: "Available today" },
];

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(SHIPPING_METHODS[0].id);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", message: "" });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Get cart data
  const { loading: loadingCart, error: cartError, data: cartData } = useQuery(GET_CART, {
    fetchPolicy: "cache-and-network",
    skip: !isAuthenticated,
  });

  // Get user profile for saved addresses
  const { loading: loadingProfile, data: profileData } = useQuery(GET_PROFILE, {
    fetchPolicy: "cache-and-network",
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data?.me?.addresses && data.me.addresses.length > 0) {
        const defaultAddress = data.me.addresses.find((addr: any) => addr.isDefault) || data.me.addresses[0];

        setShippingAddress({
          fullName: `${data.me.firstName} ${data.me.lastName}`,
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2 || "",
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          country: defaultAddress.country,
          phone: defaultAddress.phone || "",
        });
      } else if (data?.me) {
        setShippingAddress({
          ...shippingAddress,
          fullName: `${data.me.firstName} ${data.me.lastName}`,
        });
      }
    },
  });

  // Create order mutation
  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER, {
    onCompleted: (data) => {
      // Navigate to order confirmation page
      navigate(`/orders/${data.createOrder.id}`);
    },
    onError: (error) => {
      setToastMessage({
        title: "Error",
        message: error.message || "Failed to create order",
      });
      setShowToast(true);
      setIsCreatingOrder(false);
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loadingCart) {
      navigate("/login?redirect=checkout");
    }
  }, [isAuthenticated, loadingCart, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final step - place order
    if (!cartData?.cart || cartData.cart.items.length === 0) {
      setToastMessage({
        title: "Error",
        message: "Your cart is empty",
      });
      setShowToast(true);
      return;
    }

    setIsCreatingOrder(true);

    // Get shipping method details
    const shippingMethod = SHIPPING_METHODS.find(method => method.id === selectedShippingMethod);

    try {
      await createOrder({
        variables: {
          input: {
            shippingAddress: {
              fullName: shippingAddress.fullName,
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone,
            },
            shippingMethod: selectedShippingMethod,
            paymentMethod: selectedPaymentMethod,
          },
        },
      });
    } catch (err) {
      // Error is handled in the onError callback
      console.error("Order creation error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // If not authenticated or still loading auth state
  if (!isAuthenticated && loadingCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If cart has errors
  if (cartError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
            <p>Error loading cart: {cartError.message}</p>
          </div>
          <div className="text-center">
            <Button onClick={() => navigate("/cart")} variant="outline">
              Return to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cart = cartData?.cart;
  const cartItems = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;

  // Get shipping cost
  const shippingMethod = SHIPPING_METHODS.find(method => method.id === selectedShippingMethod);
  const shippingCost = shippingMethod?.price || 0;

  // Calculate total
  const total = subtotal + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {["Shipping Address", "Shipping Method", "Payment & Review"].map((step, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={`relative flex items-center justify-center mx-auto w-8 h-8 rounded-full mb-2 ${
                    currentStep > index + 1
                      ? "bg-green-500 text-white"
                      : currentStep === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className={`text-sm ${currentStep === index + 1 ? "font-semibold text-blue-600" : ""}`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

                {profileData?.me?.addresses && profileData.me.addresses.length > 0 && (
                  <div className="mb-6 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Saved Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.me.addresses.map((address: any) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            address.isDefault ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                          }`}
                          onClick={() => setShippingAddress({
                            fullName: `${profileData.me.firstName} ${profileData.me.lastName}`,
                            addressLine1: address.addressLine1,
                            addressLine2: address.addressLine2 || "",
                            city: address.city,
                            state: address.state,
                            postalCode: address.postalCode,
                            country: address.country,
                            phone: address.phone || "",
                          })}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-900">{`${profileData.me.firstName} ${profileData.me.lastName}`}</p>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Or enter a new address</h3>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address Line 1
                    </label>
                    <Input
                      type="text"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address Line 2 (Optional)
                    </label>
                    <Input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State / Province
                    </label>
                    <Input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <Input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Shipping Method</h2>
                <div className="space-y-4">
                  {SHIPPING_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedShippingMethod === method.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedShippingMethod(method.id)}
                    >
                      <div className="flex-shrink-0 h-5 w-5 mt-1">
                        <input
                          type="radio"
                          checked={selectedShippingMethod === method.id}
                          onChange={() => setSelectedShippingMethod(method.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <label className="font-medium text-gray-900">
                          {method.name}
                        </label>
                        <p className="text-gray-500 text-sm">
                          {method.eta}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Payment Method & Order Review */}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Payment Method */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex-shrink-0 h-5 w-5 mt-1">
                          <input
                            type="radio"
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label className="font-medium text-gray-900">
                            {method.name}
                          </label>
                          <p className="text-gray-500 text-sm">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Credit Card Details (only show if credit card is selected) */}
                  {selectedPaymentMethod === 'credit-card' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Card Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Card Number
                          </label>
                          <Input
                            type="text"
                            required
                            placeholder="**** **** **** ****"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Expiry Date
                            </label>
                            <Input
                              type="text"
                              required
                              placeholder="MM/YY"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              CVV
                            </label>
                            <Input
                              type="text"
                              required
                              placeholder="***"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Review */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Order Review</h2>
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-4 flex">
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                          <img
                            src={item.product.imageUrl || "https://placehold.co/200x200/e5e7eb/a3a3a3?text=Product"}
                            alt={item.product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.product.name}</h3>
                              <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                            {item.variant && (
                              <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>
                            )}
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-500">
                      <p>{shippingAddress.fullName}</p>
                      <p>{shippingAddress.addressLine1}</p>
                      {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                      <p>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`}</p>
                      <p>{shippingAddress.country}</p>
                      <p>{shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Method</h3>
                    <p className="text-sm text-gray-500">
                      {SHIPPING_METHODS.find(method => method.id === selectedShippingMethod)?.name} -
                      {" "}
                      {shippingMethod?.eta}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <dl className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <dt>Subtotal</dt>
                  <dd className="font-medium">${subtotal.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between text-sm">
                  <dt>Shipping</dt>
                  <dd className="font-medium">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </dd>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base font-medium">
                    <dt>Total</dt>
                    <dd>${total.toFixed(2)}</dd>
                  </div>
                </div>
              </dl>

              {currentStep === 3 ? (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isCreatingOrder || creatingOrder}
                >
                  {isCreatingOrder || creatingOrder ? "Processing..." : "Place Order"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              )}

              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}

              <p className="mt-4 text-center text-sm text-gray-500">
                By placing your order, you agree to our{" "}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </a>
              </p>
            </div>
          </div>
        </form>

        {/* Toast notification */}
        {showToast && (
          <Toast onClose={() => setShowToast(false)}>
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.message}</ToastDescription>
          </Toast>
        )}
      </div>
    </div>
  );
};

export default Checkout;
