'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { getMyOrders } from '@/lib/account-api';
import { formatCurrency } from '@/lib/format';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getMyOrders>>['orders']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMyOrders()
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="luxury-label mb-3">Orders</p>
          <h1 className="luxury-heading text-3xl font-light">Order Center</h1>
        </div>
        <Link
          href="/collections"
          className="hidden sm:inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-gold transition-colors"
        >
          Shop <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && (
        <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 border border-white/5 bg-luxury-black/30 p-8 sm:p-10 text-center">
          <PackageSearch className="w-7 h-7 text-luxury-gold/70 mx-auto mb-4" />
          <p className="luxury-heading text-xl font-light">No orders yet</p>
          <p className="text-sm text-luxury-smoke mt-3 max-w-md mx-auto">
            Once you purchase, your order history and tracking will appear here.
          </p>
          <div className="mt-6">
            <Link href="/collections" className="luxury-btn-primary">
              Explore the collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="block border border-white/5 bg-luxury-black/25 px-6 py-5 hover:border-luxury-gold/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-luxury-cream truncate">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-luxury-smoke mt-1">
                    {String(o.status)} • {new Date(o.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <p className="text-sm text-luxury-cream/90 whitespace-nowrap">
                    {formatCurrency(Number(o.total_amount ?? 0))}
                  </p>
                  <span className="text-[11px] uppercase tracking-wideish text-luxury-gold-muted border border-luxury-gold/20 px-3 py-1 bg-luxury-black/40">
                    {String(o.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

