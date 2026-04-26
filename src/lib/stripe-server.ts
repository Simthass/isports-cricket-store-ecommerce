import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Helper function to create a payment intent
export async function createPaymentIntent(
  amount: number,
  currency: string = "aed",
  metadata?: Record<string, string>
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    metadata,
    payment_method_types: ["card", "link"],
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });
}

// Helper function to retrieve a payment intent
export async function getPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

// Helper function to update a payment intent
export async function updatePaymentIntent(
  paymentIntentId: string,
  data: Stripe.PaymentIntentUpdateParams
) {
  return await stripe.paymentIntents.update(paymentIntentId, data);
}

// Helper function to confirm a payment intent
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
) {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}