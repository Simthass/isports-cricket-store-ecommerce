import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}

export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;