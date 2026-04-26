"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client"; // ✅ Changed from @/lib/stripe
import StripePaymentForm from "./StripePaymentForm";
import { Loader2 } from "lucide-react";

interface StripeWrapperProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function StripeWrapper({
  amount,
  onSuccess,
  onError,
  onClose,
}: StripeWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const data = await response.json();

        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          onError(data.error || "Failed to initialize payment");
        }
      } catch (err) {
        console.error("Error creating payment intent:", err);
        onError("Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, onError]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={32} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to initialize payment. Please try again.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        clientSecret={clientSecret}
      />
    </Elements>
  );
}