'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Crown, Heart, Package } from 'lucide-react';
import { getAccountDashboard } from '@/lib/account-api';
import { formatCurrency } from '@/lib/format';

type DashboardData = Awaited<ReturnType<typeof getAccountDashboard>>;

function SkeletonCard() {
  return <div className="border border-white/5 bg-luxury-charcoal/30 h-40 animate-pulse" />;
}

export default function AccountDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAccountDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const displayName = useMemo(() => data?.profile.displayName || 'Welcome', [data]);

  return (
    <div className="min-w-0">
      <div className="border border-white/5 bg-luxury-charcoal/20 backdrop-blur-sm p-8 sm:p-10">
        <p className="luxury-label mb-4">Your Fragrance Hub</p>
        <h1 className="luxury-heading text-3xl sm:text-4xl font-light tracking-tight">
          {displayName}
        </h1>
        <p className="text-sm text-luxury-smoke mt-4 max-w-2xl">
          Orders, favorites, and rewards — curated for your next purchase.
        </p>
      </div>

      {error && (
        <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="border border-white/5 bg-luxury-charcoal/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke">Tier</p>
                <Crown className="w-4.5 h-4.5 text-luxury-gold/80" />
              </div>
              <p className="luxury-heading text-2xl font-light">{data?.points.tier}</p>
              <p className="text-sm text-luxury-smoke mt-2">
                {data?.points.balance ?? 0} points
              </p>
              <div className="mt-6 h-px bg-white/5" />
              <p className="text-xs text-luxury-smoke mt-4">
                Next tier at {data?.points.nextTierAt ?? 0} points
              </p>
            </div>

            <div className="border border-white/5 bg-luxury-charcoal/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke">Wishlist</p>
                <Heart className="w-4.5 h-4.5 text-luxury-gold/80" />
              </div>
              <p className="luxury-heading text-2xl font-light">{data?.wishlist.count ?? 0}</p>
              <p className="text-sm text-luxury-smoke mt-2">Saved scents</p>
              <div className="mt-6">
                <Link
                  href="/account/wishlist"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-cream/80 hover:text-luxury-gold transition-colors"
                >
                  View wishlist <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="border border-white/5 bg-luxury-charcoal/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke">Recent orders</p>
                <Package className="w-4.5 h-4.5 text-luxury-gold/80" />
              </div>
              <p className="luxury-heading text-2xl font-light">{data?.recentOrders.length ?? 0}</p>
              <p className="text-sm text-luxury-smoke mt-2">In your history</p>
              <div className="mt-6">
                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-cream/80 hover:text-luxury-gold transition-colors"
                >
                  View orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="border border-white/5 bg-luxury-charcoal/30 p-6">
              <p className="text-[11px] uppercase tracking-wideish text-luxury-smoke mb-6">Recommendations</p>
              <p className="luxury-heading text-2xl font-light">Soon</p>
              <p className="text-sm text-luxury-smoke mt-2">
                We’ll tailor picks using your wishlist and profile.
              </p>
              <div className="mt-6">
                <Link href="/collections" className="luxury-btn-primary w-full">
                  Shop now
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-10 border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="luxury-label mb-3">Recent orders</p>
            <h2 className="luxury-heading text-2xl font-light">At a glance</h2>
          </div>
          <Link
            href="/account/orders"
            className="hidden sm:inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-gold transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="h-16 bg-white/5 animate-pulse" />
            <div className="h-16 bg-white/5 animate-pulse" />
          </div>
        ) : (data?.recentOrders.length ?? 0) === 0 ? (
          <div className="mt-8 flex items-center justify-between gap-6 border border-white/5 bg-luxury-black/30 px-6 py-5">
            <p className="text-sm text-luxury-smoke">No orders yet.</p>
            <Link href="/collections" className="luxury-btn-primary">
              Explore the collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {data?.recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-4 border border-white/5 bg-luxury-black/25 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-luxury-cream truncate">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-luxury-smoke mt-1">
                    {o.status} • {new Date(o.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-luxury-cream/90 whitespace-nowrap">
                  {formatCurrency(o.total_amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

