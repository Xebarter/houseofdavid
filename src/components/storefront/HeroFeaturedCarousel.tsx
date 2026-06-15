'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { productPath } from '@/lib/product-routes';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { HERO_PRODUCT_SIZES } from '@/lib/images/urls';

type HeroFeaturedCarouselProps = {
  products: Product[];
  onOpenCart?: () => void;
  onActiveProductChange?: (product: Product) => void;
};

const AUTO_ADVANCE_MS = 7000;

export function HeroFeaturedCarousel({
  products,
  onOpenCart,
  onActiveProductChange,
}: HeroFeaturedCarouselProps) {
  const { addToCart } = useCart();
  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = products.length;
  const product = products[index];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
      setAdded(false);
    },
    [count]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (product) onActiveProductChange?.(product);
  }, [product, onActiveProductChange]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(goNext, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, goNext, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  if (!product) return null;

  const handleAddToBag = () => {
    addToCart(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    onOpenCart?.();
  };

  const badge = product.is_limited
    ? 'Limited Edition'
    : product.is_new
      ? 'New Arrival'
      : product.featured
        ? 'Signature'
        : null;

  return (
    <div
      className="w-full max-w-md lg:max-w-none mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const endX = e.changedTouches[0]?.clientX;
        if (endX === undefined) return;
        const delta = endX - touchStartX.current;
        if (Math.abs(delta) > 48) {
          if (delta < 0) goNext();
          else goPrev();
        }
        touchStartX.current = null;
      }}
    >
      <div className="relative border border-white/10 bg-luxury-black/45 backdrop-blur-xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.75)]">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/55 to-transparent" />
        <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <p className="luxury-label text-[10px] sm:text-xs">Featured Selection</p>
            {badge && (
              <span className="luxury-label text-[9px] text-luxury-gold border border-luxury-gold/30 px-2.5 py-1 bg-luxury-black/50">
                {badge}
              </span>
            )}
          </div>

          <div key={product.id} className="animate-hero-slide-in">
            <div className="relative aspect-[4/5] overflow-hidden border border-white/5 bg-luxury-charcoal mb-6">
              <OptimizedImage
                src={product.image_url || DEFAULT_PRODUCT_IMAGE}
                variants={product.image_variants}
                alt={product.name}
                sizes={HERO_PRODUCT_SIZES}
                aspectRatio="4/5"
                priority
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/70 via-transparent to-luxury-black/20 pointer-events-none" />
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted">
                {product.concentration} · {product.volume_ml}ml
              </p>
              <Link
                href={productPath(product)}
                className="luxury-heading text-2xl sm:text-3xl font-light leading-tight hover:text-luxury-gold-light transition-colors duration-300 block"
              >
                {product.name}
              </Link>
              {product.short_description && (
                <p className="text-sm text-luxury-cream/55 font-light line-clamp-2 leading-relaxed">
                  {product.short_description}
                </p>
              )}
              <div className="flex items-baseline gap-3 pt-1">
                <p className="text-lg text-luxury-cream tracking-wide">{formatCurrency(product.price)}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="text-sm text-luxury-smoke line-through font-light">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleBuyNow}
                className="luxury-btn-primary flex-1 min-h-[46px]"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleAddToBag}
                className="flex-1 min-h-[46px] inline-flex items-center justify-center px-6 text-xs font-medium uppercase tracking-wideish border border-white/15 text-luxury-cream/90 hover:border-luxury-gold/40 hover:text-luxury-cream transition-all duration-500"
              >
                {added ? 'Added to Bag' : 'Add to Bag'}
              </button>
            </div>
          </div>

          {count > 1 && (
            <div className="flex items-center justify-between mt-7 pt-5 border-t border-white/5">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous fragrance"
                className="p-2 text-luxury-gold-muted hover:text-luxury-gold transition-colors"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1} />
              </button>

              <div className="flex items-center gap-2">
                {products.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show ${item.name}`}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === index
                        ? 'w-8 bg-luxury-gold'
                        : 'w-1.5 bg-luxury-gold/25 hover:bg-luxury-gold/50'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next fragrance"
                className="p-2 text-luxury-gold-muted hover:text-luxury-gold transition-colors"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
