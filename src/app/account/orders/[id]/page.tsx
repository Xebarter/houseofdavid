'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, RefreshCw, MessageSquareText } from 'lucide-react';
import { getMyOrderDetails } from '@/lib/account-api';
import { formatCurrency } from '@/lib/format';
import { BRAND_EMAIL } from '@/lib/brand';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/types';

type Details = Awaited<ReturnType<typeof getMyOrderDetails>>;

const STATUS_STEPS: Array<{ key: string; label: string }> = [
  { key: 'pending', label: 'Order received' },
  { key: 'paid', label: 'Payment confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function normalizeStatus(input: unknown): string {
  const s = String(input ?? 'pending').toLowerCase();
  return s;
}

function stepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((x) => x.key === status);
  if (idx >= 0) return idx;
  if (status === 'cancelled' || status === 'failed' || status === 'refunded') return 0;
  return 0;
}

export default function AccountOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();

  const orderId = params?.id;

  const [data, setData] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    getMyOrderDetails(orderId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const order = data?.order ?? null;
  const items = data?.items ?? [];
  const products = data?.products ?? [];

  const productMap = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products]);
  const status = normalizeStatus(order?.status);
  const activeIdx = stepIndex(status);

  const currency = String(order?.currency ?? 'UGX');
  const total = Number(order?.total_amount ?? 0);

  const lineItems = useMemo(() => {
    return items.map((i) => {
      const productId = String(i.product_id ?? '');
      const product = productMap.get(productId) as unknown as Product | undefined;
      return {
        id: String(i.id),
        productId,
        product,
        quantity: Number(i.quantity ?? 0),
        price: Number(i.price ?? 0),
        volume_ml: Number(i.volume_ml ?? 0),
      };
    });
  }, [items, productMap]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0),
    [lineItems]
  );

  const onReorder = async () => {
    setReordering(true);
    try {
      for (const li of lineItems) {
        if (li.product) {
          addToCart(li.product, li.quantity || 1);
        }
      }
      router.push('/collections');
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-cream transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to orders
            </Link>
            <p className="luxury-label mt-6 mb-3">Order</p>
            <h1 className="luxury-heading text-3xl font-light">
              #{String(orderId ?? '').slice(0, 8)}
            </h1>
            <p className="text-sm text-luxury-smoke mt-3">
              {loading ? 'Loading…' : new Date(String(order?.created_at ?? Date.now())).toLocaleString()}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href={`/account/orders/${orderId}/invoice`}
              className="inline-flex items-center justify-center px-5 py-3 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Invoice
            </Link>
            <button
              type="button"
              onClick={onReorder}
              disabled={reordering || loading}
              className="luxury-btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {reordering ? 'Adding…' : 'Reorder'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke">Tracking</p>
            <span className="text-[11px] uppercase tracking-wideish text-luxury-gold-muted border border-luxury-gold/20 px-3 py-1 bg-luxury-black/40">
              {status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STATUS_STEPS.map((s, idx) => {
              const complete = idx < activeIdx;
              const active = idx === activeIdx;
              return (
                <div
                  key={s.key}
                  className={`border px-5 py-4 ${
                    active
                      ? 'border-luxury-gold/30 bg-luxury-black/30'
                      : 'border-white/5 bg-luxury-black/20'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke">Step {idx + 1}</p>
                  <p className="text-sm mt-2 text-luxury-cream">{s.label}</p>
                  <p className={`text-xs mt-2 ${complete ? 'text-luxury-gold-muted' : 'text-luxury-smoke'}`}>
                    {complete ? 'Complete' : active ? 'In progress' : 'Upcoming'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="luxury-label mb-3">Items</p>
            <h2 className="luxury-heading text-2xl font-light">Order contents</h2>
          </div>
          <p className="text-sm text-luxury-smoke">
            {loading ? '—' : `${lineItems.length} item${lineItems.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {lineItems.map((li) => (
              <div
                key={li.id}
                className="flex items-center justify-between gap-4 border border-white/5 bg-luxury-black/25 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-luxury-cream truncate">
                    {li.product?.name ?? 'Product'}
                  </p>
                  <p className="text-xs text-luxury-smoke mt-1">
                    {li.volume_ml}ml • Qty {li.quantity}
                  </p>
                </div>
                <p className="text-sm text-luxury-cream/90 whitespace-nowrap">
                  {formatCurrency(li.price * li.quantity, currency)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-white/5 pt-8">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex items-center justify-between text-sm text-luxury-smoke">
              <span>Subtotal</span>
              <span className="text-luxury-cream/90">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-luxury-smoke">
              <span>Shipping</span>
              <span className="text-luxury-cream/90">{formatCurrency(Math.max(0, total - subtotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-luxury-cream pt-3 border-t border-white/5">
              <span>Total</span>
              <span className="luxury-heading text-xl font-light">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-white/5 pt-8">
          <div className="flex items-center gap-3">
            <Link
              href={`/account/orders/${orderId}/invoice`}
              className="inline-flex items-center justify-center px-5 py-3 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Download invoice
            </Link>
            <button
              type="button"
              onClick={onReorder}
              disabled={reordering || loading}
              className="luxury-btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {reordering ? 'Adding…' : 'Reorder'}
            </button>
          </div>

          <a
            href={`mailto:${BRAND_EMAIL}?subject=Order%20${encodeURIComponent(String(orderId ?? '').slice(0, 8))}`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-cream transition-colors"
          >
            <MessageSquareText className="w-4 h-4" />
            Support
          </a>
        </div>
      </div>
    </div>
  );
}

