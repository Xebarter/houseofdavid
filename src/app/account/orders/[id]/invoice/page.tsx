'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { getMyOrderDetails } from '@/lib/account-api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { formatCurrency } from '@/lib/format';

export default function AccountInvoicePage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getMyOrderDetails>> | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    getMyOrderDetails(orderId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const currency = String(data?.order?.currency ?? 'UGX');
  const total = Number(data?.order?.total_amount ?? 0);

  const items = useMemo(() => {
    const products = new Map((data?.products ?? []).map((p) => [String(p.id), p]));
    return (data?.items ?? []).map((i) => {
      const pid = String(i.product_id ?? '');
      const product = products.get(pid) as Record<string, unknown> | undefined;
      const qty = Number(i.quantity ?? 0);
      const price = Number(i.price ?? 0);
      return {
        id: String(i.id),
        name: String(product?.name ?? 'Product'),
        qty,
        price,
        line: qty * price,
      };
    });
  }, [data]);

  const subtotal = items.reduce((sum, i) => sum + i.line, 0);
  const shipping = Math.max(0, total - subtotal);

  return (
    <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Link
            href={`/account/orders/${orderId}`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to order
          </Link>
          <p className="luxury-label mt-6 mb-3">Invoice</p>
          <h1 className="luxury-heading text-3xl font-light">
            #{String(orderId ?? '').slice(0, 8)}
          </h1>
          <p className="text-sm text-luxury-smoke mt-3">
            {loading ? 'Loading…' : new Date(String(data?.order?.created_at ?? Date.now())).toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="luxury-btn-primary"
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-2" />
          Download / Print
        </button>
      </div>

      {error && (
        <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-10 border border-white/5 bg-luxury-black/25 p-8 print:bg-white print:text-black print:border-black/10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <BrandLogo size="md" showName className="mb-4 print:mb-3" nameClassName="text-xl print:text-black" />
            <p className="text-sm text-luxury-smoke print:text-black/70">Premium Fragrance House</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke print:text-black/60">Invoice</p>
            <p className="text-sm text-luxury-cream mt-2 print:text-black">Order #{String(orderId ?? '').slice(0, 8)}</p>
            <p className="text-sm text-luxury-smoke mt-1 print:text-black/70">
              {new Date(String(data?.order?.created_at ?? Date.now())).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 h-px bg-white/10 print:bg-black/10" />

        {loading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/5 animate-pulse print:bg-black/5" />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-[1fr_80px_120px] gap-4 text-[11px] uppercase tracking-wideish text-luxury-smoke print:text-black/60">
              <div>Item</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Total</div>
            </div>
            <div className="mt-3 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="grid grid-cols-[1fr_80px_120px] gap-4 border-t border-white/5 pt-3 print:border-black/10">
                  <div className="text-sm text-luxury-cream print:text-black">{i.name}</div>
                  <div className="text-sm text-right text-luxury-smoke print:text-black/70">{i.qty}</div>
                  <div className="text-sm text-right text-luxury-cream print:text-black">
                    {formatCurrency(i.line, currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 print:border-black/10">
              <div className="max-w-sm ml-auto space-y-2">
                <div className="flex items-center justify-between text-sm text-luxury-smoke print:text-black/70">
                  <span>Subtotal</span>
                  <span className="text-luxury-cream print:text-black">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-luxury-smoke print:text-black/70">
                  <span>Shipping</span>
                  <span className="text-luxury-cream print:text-black">{formatCurrency(shipping, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-white/10 print:border-black/10">
                  <span className="text-luxury-smoke print:text-black/70">Total</span>
                  <span className="luxury-heading text-xl font-light print:text-black">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

