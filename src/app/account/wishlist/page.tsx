'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, HeartOff, Plus, Share2, Trash2 } from 'lucide-react';
import {
  createWishlist,
  deleteWishlist,
  getWishlists,
  syncWishlistAlerts,
  updateWishlists,
  type WishlistList,
} from '@/lib/account-api';
import { trackEvent } from '@/lib/analytics';
import { getStorefrontCatalog } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/storefront/ProductCard';

export default function AccountWishlistPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<WishlistList[]>([]);
  const [activeId, setActiveId] = useState<string>('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getWishlists(), getStorefrontCatalog(), syncWishlistAlerts().catch(() => null)])
      .then(([wl, catalog]) => {
        setLists(wl.lists);
        setActiveId(wl.defaultListId || wl.lists[0]?.id || 'default');
        setProducts(catalog.products);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []);

  const activeList = useMemo(
    () => lists.find((l) => l.id === activeId) ?? lists[0] ?? null,
    [lists, activeId]
  );

  const activeProductIds = activeList?.productIds ?? [];

  const wishlistProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return activeProductIds.map((id) => map.get(id)).filter(Boolean) as Product[];
  }, [products, activeProductIds]);

  const remove = async (id: string) => {
    if (!activeList) return;
    const nextIds = activeList.productIds.filter((x) => x !== id);
    const nextLists = lists.map((l) => (l.id === activeList.id ? { ...l, productIds: nextIds } : l));
    setLists(nextLists);
    setSaving(true);
    try {
      await updateWishlists({
        lists: [{ id: activeList.id, productIds: nextIds }],
      });
      trackEvent({ type: 'wishlist_remove', product_id: id, wishlist_id: activeList.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update wishlist');
      // Re-fetch to recover
      const wl = await getWishlists();
      setLists(wl.lists);
      setActiveId(wl.defaultListId);
    } finally {
      setSaving(false);
    }
  };

  const createList = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await createWishlist('New wishlist');
      const wl = await getWishlists();
      setLists(wl.lists);
      setActiveId(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create wishlist');
    } finally {
      setCreating(false);
    }
  };

  const toggleShare = async () => {
    if (!activeList) return;
    const shareId =
      activeList.shareId ?? Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    setSaving(true);
    try {
      await updateWishlists({ lists: [{ id: activeList.id, shareId }] });
      const wl = await getWishlists();
      setLists(wl.lists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enable sharing');
    } finally {
      setSaving(false);
    }
  };

  const copyShareLink = async () => {
    if (!activeList?.shareId) return;
    const url = `${window.location.origin}/wishlist/${activeList.shareId}`;
    await navigator.clipboard.writeText(url);
  };

  const removeList = async () => {
    if (!activeList) return;
    if (lists.length <= 1) return;
    setSaving(true);
    try {
      await deleteWishlist(activeList.id);
      const wl = await getWishlists();
      setLists(wl.lists);
      setActiveId(wl.defaultListId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete wishlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-white/5 bg-luxury-charcoal/15 backdrop-blur-sm p-8 sm:p-10">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="luxury-label mb-3">Wishlist</p>
          <h1 className="luxury-heading text-3xl font-light">Saved scents</h1>
          <p className="text-sm text-luxury-smoke mt-3">Keep your next purchase within reach.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={createList}
            disabled={creating}
            className="inline-flex items-center justify-center px-5 py-3 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New list
          </button>
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

      {!loading && lists.length > 0 && (
        <div className="mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border border-white/5 bg-luxury-black/25 px-6 py-5">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {lists.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={async () => {
                  setActiveId(l.id);
                  await updateWishlists({ defaultListId: l.id });
                }}
                className={`shrink-0 text-[11px] uppercase tracking-wideish px-4 py-2 border transition-colors ${
                  l.id === activeId
                    ? 'border-luxury-gold/30 text-luxury-gold bg-luxury-black/40'
                    : 'border-white/10 text-luxury-smoke hover:text-luxury-cream hover:border-luxury-gold/20'
                }`}
              >
                {l.name} ({l.productIds.length})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShare}
              disabled={saving || !activeList}
              className="inline-flex items-center justify-center px-4 py-2.5 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors disabled:opacity-40"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {activeList?.shareId ? 'Sharing on' : 'Share'}
            </button>
            {activeList?.shareId && (
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex items-center justify-center px-4 py-2.5 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy link
              </button>
            )}
            <button
              type="button"
              onClick={removeList}
              disabled={saving || lists.length <= 1}
              className="inline-flex items-center justify-center px-4 py-2.5 text-[11px] uppercase tracking-wideish border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-red-500/30 transition-colors disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
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
      ) : wishlistProducts.length === 0 ? (
        <div className="mt-10 border border-white/5 bg-luxury-black/30 p-8 sm:p-10 text-center">
          <HeartOff className="w-7 h-7 text-luxury-gold/70 mx-auto mb-4" />
          <p className="luxury-heading text-xl font-light">Your wishlist is empty</p>
          <p className="text-sm text-luxury-smoke mt-3 max-w-md mx-auto">
            Add fragrances you love so you can come back and buy in a moment.
          </p>
          <div className="mt-6">
            <Link href="/collections" className="luxury-btn-primary">
              Explore the collection
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-luxury-smoke">{wishlistProducts.length} saved</p>
            {saving && <p className="text-xs text-luxury-smoke">Saving…</p>}
          </div>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 sm:gap-x-8 sm:gap-y-16">
            {wishlistProducts.map((p) => (
              <div key={p.id} className="group">
                <ProductCard product={p} />
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="mt-3 w-full text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-cream transition-colors border border-white/10 hover:border-luxury-gold/30 py-2.5"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

