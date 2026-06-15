'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { productPath } from '@/lib/product-routes';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { PRODUCT_CARD_SIZES } from '@/lib/images/urls';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'showcase';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isShowcase = variant === 'showcase';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const badge = product.is_limited ? 'Limited' : product.is_new ? 'New' : product.featured ? 'Signature' : null;

  if (isShowcase) {
    return (
      <Link href={productPath(product)} className="group block">
        <article>
          <div className="relative aspect-[4/5] overflow-hidden bg-luxury-charcoal border border-white/5 group-hover:border-luxury-gold/25 transition-colors duration-700">
            <OptimizedImage
              src={product.image_url || DEFAULT_PRODUCT_IMAGE}
              variants={product.image_variants}
              alt={product.name}
              sizes="(max-width: 640px) 100vw, 50vw"
              aspectRatio="4/5"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/20 to-transparent" />

            {badge && (
              <span className="absolute top-5 left-5 luxury-label text-[10px] text-luxury-gold border border-luxury-gold/25 px-2.5 py-1 bg-luxury-black/50 backdrop-blur-sm z-10">
                {badge}
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-10">
              <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-2">
                {product.concentration} · {product.volume_ml}ml
              </p>
              <h3 className="luxury-heading text-2xl sm:text-3xl font-light mb-2 group-hover:text-luxury-gold-light transition-colors">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-5">
                <p className="text-sm text-luxury-cream">{formatCurrency(product.price)}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="text-xs text-luxury-smoke line-through">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wideish text-luxury-cream/90 group-hover:text-luxury-gold transition-colors">
                  Shop
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-cream transition-colors border-l border-white/10 pl-4"
                >
                  {added ? 'Added' : 'Add to bag'}
                </button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={productPath(product)} className="group block">
      <article>
        <div className="relative aspect-[3/4] overflow-hidden bg-luxury-charcoal border border-white/5 group-hover:border-luxury-gold/20 transition-colors duration-500 mb-5">
          <OptimizedImage
            src={product.image_url || DEFAULT_PRODUCT_IMAGE}
            variants={product.image_variants}
            alt={product.name}
            sizes={PRODUCT_CARD_SIZES}
            aspectRatio="3/4"
            className="w-full h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {badge && (
            <span className="absolute top-4 left-4 luxury-label text-[10px] text-luxury-gold border border-luxury-gold/25 px-2.5 py-1 bg-luxury-black/40 backdrop-blur-sm z-10">
              {badge}
            </span>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 z-10 py-3.5 text-[11px] uppercase tracking-wideish text-luxury-cream bg-luxury-black/85 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500 hover:bg-luxury-gold hover:text-luxury-black"
          >
            {added ? 'Added' : 'Add to bag'}
          </button>
        </div>

        <div className="space-y-1.5 px-0.5">
          <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted">
            {product.concentration} · {product.volume_ml}ml
          </p>
          <h3 className="luxury-heading text-base sm:text-lg font-medium group-hover:text-luxury-gold-light transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-sm text-luxury-cream/90">{formatCurrency(product.price)}</p>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="text-xs text-luxury-smoke line-through">
                {formatCurrency(product.compare_at_price)}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
