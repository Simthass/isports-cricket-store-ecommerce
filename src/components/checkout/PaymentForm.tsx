"use client";

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export function StripePaymentForm({ amount, onSuccess, onError, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe is not initialized. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        // Fix: Handle potentially undefined message
        const errorMessage = submitError.message || 'Payment submission failed';
        onError(errorMessage);
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Fix: Handle potentially undefined message
        const errorMessage = error.message || 'Payment failed';
        onError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      onError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            paymentMethod === 'card'
              ? 'border-b-2 border-[#004b9c] text-[#004b9c]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard size={16} />
          Card Payment
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('wallet')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            paymentMethod === 'wallet'
              ? 'border-b-2 border-[#004b9c] text-[#004b9c]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Smartphone size={16} />
          Digital Wallet
        </button>
      </div>

      {/* Payment Element - Stripe handles card, Apple Pay, Google Pay automatically */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 py-3 rounded-xl bg-[#004b9c] text-white font-semibold hover:bg-[#003d82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            `Pay AED ${amount.toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
}

// Embedded Checkout for Apple Pay/Google Pay (alternative simpler flow)
export function StripeEmbeddedCheckout({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }
        return data;
      })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret received');
        }
      })
      .catch((err) => {
        console.error('Error fetching client secret:', err);
        setError(err.message);
      });
  }, [amount]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#004b9c] text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={32} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}