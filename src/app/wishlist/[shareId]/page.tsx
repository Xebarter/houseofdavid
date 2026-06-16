'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Share2 } from 'lucide-react';
import { getStorefrontCatalog } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/storefront/ProductCard';

type PublicList = {
  id: string;
  name: string;
  productIds: string[];
  shareId: string | null;
};

export default function SharedWishlistPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params?.shareId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<PublicList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/wishlist/${encodeURIComponent(shareId)}`).then(async (r) => {
        if (!r.ok) throw new Error('Wishlist not found');
        return (await r.json()) as { list: PublicList };
      }),
      getStorefrontCatalog(),
    ])
      .then(([res, catalog]) => {
        setList(res.list);
        setProducts(catalog.products);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, [shareId]);

  const items = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return (list?.productIds ?? []).map((id) => map.get(id)).filter(Boolean) as Product[];
  }, [products, list]);

  return (
    <main className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="luxury-label mb-3">Wishlist</p>
              <h1 className="luxury-heading text-3xl font-light">
                {loading ? 'Loading…' : list?.name ?? 'Shared wishlist'}
              </h1>
              <p className="text-sm text-luxury-smoke mt-3">A curated selection — ready to shop.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke">
                <Share2 className="w-4 h-4" />
                Shared
              </span>
              <Link href="/collections" className="luxury-btn-primary">
                Shop
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-8 border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 sm:gap-x-8 sm:gap-y-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] bg-white/5 animate-pulse mb-5" />
                  <div className="h-3 w-20 bg-white/5 animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10 border border-white/5 bg-luxury-black/30 p-8 sm:p-10 text-center">
              <p className="luxury-heading text-xl font-light">No items</p>
              <p className="text-sm text-luxury-smoke mt-3">This wishlist is empty.</p>
              <div className="mt-6">
                <Link href="/collections" className="luxury-btn-primary">
                  Explore the collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <p className="text-sm text-luxury-smoke mb-6">{items.length} saved</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 sm:gap-x-8 sm:gap-y-16">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

