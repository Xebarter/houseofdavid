import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PaymentResult } from '@/components/storefront/PaymentResult';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Payment Result | ${BRAND_NAME}`,
  robots: { index: false },
};

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}
