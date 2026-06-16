'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, User } from 'lucide-react';
import { getStorefrontCatalog } from '@/lib/firestore';
import { BRAND_SIDEBAR_LOGO_SRC } from '@/lib/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PERFUME_CATEGORIES } from '@/components/admin/products/productFormUtils';
import { enrichCategories } from '@/lib/collections-utils';
import { getFeaturedProducts, DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { productPath } from '@/lib/product-routes';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { Product, Category } from '@/lib/types';

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const SECONDARY_LINKS = [
  { label: 'Journal', href: '/journal' },
  { label: 'Our Story', href: '/about' },
] as const;

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    getStorefrontCatalog()
      .then(({ products: p, categories: c }) => {
        setProducts(p);
        setCategories(c);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories;
    return PERFUME_CATEGORIES.map((c) => ({ ...c, slug: c.id, created_at: '' }));
  }, [categories]);

  const categoriesWithMeta = useMemo(
    () => enrichCategories(categoryOptions, products).filter((c) => c.productCount > 0),
    [categoryOptions, products]
  );

  const spotlight = useMemo(() => getFeaturedProducts(products, 1)[0] ?? null, [products]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-luxury-black/80 backdrop-blur-sm animate-fade-in"
      />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-[min(100vw,400px)] flex flex-col bg-luxury-charcoal border-l border-white/10 shadow-2xl animate-slide-in-right">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 min-h-[4.5rem] border-b border-white/5 shrink-0 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center hover:opacity-90 transition-opacity"
            aria-label="House of David home"
          >
            <BrandLogo
              size="sm"
              src={BRAND_SIDEBAR_LOGO_SRC}
              framed
              showName
              priority
              className="min-w-0"
              nameClassName="text-sm leading-tight"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 shrink-0 flex items-center justify-center border border-white/10 text-luxury-cream/80 hover:text-luxury-cream hover:border-luxury-gold/30 transition-colors"
          >
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-8">
          {/* Spotlight product */}
          {spotlight && (
            <button
              type="button"
              onClick={() => go(productPath(spotlight))}
              className="group w-full text-left relative overflow-hidden border border-white/10 hover:border-luxury-gold/25 transition-colors duration-500"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-luxury-black">
                <OptimizedImage
                  src={spotlight.image_url || DEFAULT_PRODUCT_IMAGE}
                  variants={spotlight.image_variants}
                  alt={spotlight.name}
                  sizes="400px"
                  aspectRatio="16/9"
                  className="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/30 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="luxury-label text-[9px] mb-2">Featured</p>
                <p className="luxury-heading text-xl font-light text-luxury-cream group-hover:text-luxury-gold-light transition-colors line-clamp-1">
                  {spotlight.name}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] uppercase tracking-wideish text-luxury-gold-muted">
                  Shop now <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => go('/collections')}
            className="luxury-btn-primary w-full min-h-[48px]"
          >
            Explore Collection
          </button>

          {/* Categories */}
          <div>
            <p className="luxury-label mb-4">Fragrance Families</p>
            {!loaded ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : categoriesWithMeta.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {categoriesWithMeta.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => go(`/collections?category=${category.id}`)}
                    className="group relative overflow-hidden text-left border border-white/5 hover:border-luxury-gold/25 transition-colors duration-500"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-luxury-black">
                      <OptimizedImage
                        src={category.coverImage || DEFAULT_PRODUCT_IMAGE}
                        alt={category.name}
                        sizes="50vw"
                        aspectRatio="4/5"
                        className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/25 to-luxury-black/10" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="luxury-heading text-sm font-medium text-luxury-cream group-hover:text-luxury-gold-light transition-colors">
                        {category.name}
                      </p>
                      <p className="text-[9px] uppercase tracking-wideish text-luxury-smoke mt-0.5">
                        {category.productCount} piece{category.productCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-luxury-smoke">Browse the full collection.</p>
            )}
          </div>

          {/* Secondary links */}
          <div className="border-t border-white/5 pt-6 space-y-1">
            <button
              type="button"
              onClick={() => go('/account')}
              className="w-full flex items-center justify-between py-4 border-b border-white/5 text-left group"
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4 text-luxury-gold-muted" strokeWidth={1.25} />
                <span className="text-sm uppercase tracking-wideish text-luxury-cream/80 group-hover:text-luxury-cream transition-colors">
                  Account
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-luxury-smoke group-hover:text-luxury-gold transition-colors" />
            </button>
            {SECONDARY_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => go(link.href)}
                className="w-full flex items-center justify-between py-4 border-b border-white/5 text-left group"
              >
                <span className="text-sm uppercase tracking-wideish text-luxury-cream/80 group-hover:text-luxury-cream transition-colors">
                  {link.label}
                </span>
                <ChevronRight className="w-4 h-4 text-luxury-smoke group-hover:text-luxury-gold transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer strip */}
        <div className="shrink-0 px-6 py-5 border-t border-white/5 bg-luxury-black/40">
          <Link
            href="/"
            onClick={onClose}
            className="text-[10px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-cream transition-colors"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
