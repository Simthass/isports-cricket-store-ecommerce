"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, CreditCard, Smartphone, Apple } from "lucide-react";

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  clientSecret: string;
}

export default function StripePaymentForm({
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe is not initialized. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || "Payment submission failed");
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/cart?payment_status=completed`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      onError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Method Icons */}
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-gray-500" />
          <span className="text-[12px] text-gray-500">Card</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone size={18} className="text-gray-500" />
          <span className="text-[12px] text-gray-500">Google Pay</span>
        </div>
        <div className="flex items-center gap-2">
          <Apple size={18} className="text-gray-500" />
          <span className="text-[12px] text-gray-500">Apple Pay</span>
        </div>
      </div>

      <PaymentElement 
        options={{
          layout: "tabs",
          defaultValues: {
            billingDetails: {
              name: "Customer",
            },
          },
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay AED {amount.toLocaleString()}
          </>
        )}
      </button>
    </form>
  );
}