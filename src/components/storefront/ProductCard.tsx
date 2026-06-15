'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { productPath } from '@/lib/product-routes';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { PRODUCT_CARD_SIZES } from '@/lib/images/urls';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {(product.featured || product.is_new || product.is_limited) && (
            <span className="absolute top-4 left-4 luxury-label text-[10px] text-luxury-gold border border-luxury-gold/25 px-2.5 py-1 bg-luxury-black/40 backdrop-blur-sm z-10">
              {product.is_limited ? 'Limited' : product.is_new ? 'New' : 'Signature'}
            </span>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 z-10 py-4 text-xs uppercase tracking-wideish text-luxury-cream bg-luxury-black/80 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500 hover:bg-luxury-gold hover:text-luxury-black"
          >
            {added ? 'Added' : 'Add to Bag'}
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted">
            {product.concentration} · {product.volume_ml}ml
          </p>
          <h3 className="luxury-heading text-lg font-medium group-hover:text-luxury-gold-light transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 pt-1">
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
