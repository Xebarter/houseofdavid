'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 10;

type StatusResponse = {
  success: boolean;
  pending?: boolean;
  orderId?: string;
  status?: string;
};

async function fetchPaymentStatus(orderId?: string | null, purchaseId?: string | null): Promise<StatusResponse> {
  const params = new URLSearchParams();
  if (orderId) params.set('orderId', orderId);
  if (purchaseId) params.set('purchaseId', purchaseId);

  const response = await fetch(`/api/paytota/status?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Status check failed');
  }

  return response.json();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PaymentResult() {
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const handlePaymentResult = async () => {
      const orderIdParam = searchParams?.get('order_id');
      const purchaseIdParam = searchParams?.get('purchase_id');

      if (!orderIdParam && !purchaseIdParam) {
        setPaymentSuccess(false);
        setLoading(false);
        return;
      }

      if (orderIdParam) setOrderId(orderIdParam);

      try {
        let lastResult: StatusResponse | null = null;

        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
          if (cancelled) return;

          lastResult = await fetchPaymentStatus(orderIdParam, purchaseIdParam);

          if (lastResult.orderId) setOrderId(lastResult.orderId);
          if (lastResult.success) {
            setPaymentSuccess(true);
            setLoading(false);
            return;
          }

          if (!lastResult.pending) {
            setPaymentSuccess(false);
            setLoading(false);
            return;
          }

          if (attempt < MAX_POLL_ATTEMPTS - 1) {
            await wait(POLL_INTERVAL_MS);
          }
        }

        setPaymentSuccess(lastResult?.success ?? false);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentSuccess(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    handlePaymentResult();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md w-full text-center border border-amber-900/50">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-amber-50 mb-2">Processing Payment</h2>
          <p className="text-amber-200">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md w-full text-center border border-amber-900/50">
        {paymentSuccess ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 mb-4">
              <Check className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-50 mb-2">Payment Successful!</h2>
            <p className="text-amber-200 mb-6">
              Your order #{orderId} has been confirmed. A confirmation email has been sent to you.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-50 mb-2">Payment Failed</h2>
            <p className="text-amber-200 mb-6">
              We couldn&apos;t process your payment. Please try again or contact support.
            </p>
          </>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
