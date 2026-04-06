"use client";

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface CODCheckoutProps {
  onSubmit: (orderData: any) => Promise<void>;
  isLoading: boolean;
}

export function CODCheckout({ onSubmit, isLoading }: CODCheckoutProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async () => {
    setConfirmed(true);
    await onSubmit({ paymentMethod: 'cod' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">Cash on Delivery</p>
            <p className="text-sm text-green-700 mt-1">
              Pay when your order arrives. No additional fees.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          ⚠️ Please have exact change ready as our delivery partners may not carry change.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || confirmed}
        className="w-full py-3 rounded-xl bg-[#81bf42] text-white font-semibold hover:bg-[#6ea835] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          'Place Order (Cash on Delivery)'
        )}
      </button>
    </div>
  );
}