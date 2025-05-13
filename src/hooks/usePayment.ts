import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "");

interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paymentIntentId?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  failureMessage?: string;
}

enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($amount: Float!, $orderId: ID!) {
    createPaymentIntent(amount: $amount, orderId: $orderId) {
      _id
      orderId
      userId
      method
      amount
      status
      transactionId
      paymentIntentId
      receiptUrl
      createdAt
      updatedAt
      paidAt
      failureMessage
    }
  }
`;

const SAVE_PAYMENT_METHOD = gql`
  mutation SavePaymentMethod($paymentMethodId: String!) {
    savePaymentMethod(paymentMethodId: $paymentMethodId) {
      _id
      userId
      method
      card {
        brand
        last4
        expMonth
        expYear
      }
    }
  }
`;

const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($paymentIntentId: String!, $orderId: ID!) {
    processPayment(paymentIntentId: $paymentIntentId, orderId: $orderId) {
      _id
      orderId
      status
      transactionId
      receiptUrl
      paidAt
      failureMessage
    }
  }
`;

const REFUND_PAYMENT = gql`
  mutation RefundPayment($paymentId: ID!, $amount: Float) {
    refundPayment(paymentId: $paymentId, amount: $amount) {
      _id
      status
      transactionId
      failureMessage
    }
  }
`;

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

export function usePayment() {
  const stripe = useStripe();
  const elements = useElements();
  const [createPaymentIntentMutation] = useMutation(CREATE_PAYMENT_INTENT);
  const [savePaymentMethodMutation] = useMutation(SAVE_PAYMENT_METHOD);
  const [processPaymentMutation] = useMutation(PROCESS_PAYMENT);
  const [refundPaymentMutation] = useMutation(REFUND_PAYMENT);

  const createPaymentIntent = async (
    amount: number,
    orderId: string
  ): Promise<Payment> => {
    const { data } = await createPaymentIntentMutation({
      variables: { amount, orderId },
    });
    return data.createPaymentIntent;
  };

  const processPayment = async ({
    amount,
    orderId,
    paymentMethodId,
  }: {
    amount: number;
    orderId: string;
    paymentMethodId?: string;
  }) => {
    if (!stripe || !elements) {
      throw new Error("Stripe has not been initialized");
    }

    // Create a payment intent
    const paymentIntent = await createPaymentIntent(amount, orderId);

    if (paymentMethodId) {
      // Use existing payment method
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntent.paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }
    } else {
      // Use new card
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Confirm the payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntent.paymentIntentId,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Save the payment method for future use
      try {
        await savePaymentMethodMutation({
          variables: { paymentMethodId: paymentMethod.id },
        });
      } catch (err) {
        console.error("Failed to save payment method:", err);
      }
    }

    // Process the payment on the backend
    const { data } = await processPaymentMutation({
      variables: {
        paymentIntentId: paymentIntent.paymentIntentId,
        orderId,
      },
    });

    return data.processPayment;
  };

  const refundPayment = async (paymentId: string, amount?: number) => {
    const { data } = await refundPaymentMutation({
      variables: { paymentId, amount },
    });
    return data.refundPayment;
  };

  return {
    stripe,
    elements,
    CardElement,
    processPayment,
    refundPayment,
  };
}
