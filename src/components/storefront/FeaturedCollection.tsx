'use client';

import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { ArrowRight } from 'lucide-react';
import { productPath } from '@/lib/product-routes';

interface FeaturedCollectionProps {
  products?: Product[];
  loading?: boolean;
}

export function FeaturedCollection({ products, loading = false }: FeaturedCollectionProps) {
  const featured = products
    ? (() => {
        const items = products.filter((p) => p.featured).slice(0, 3);
        return items.length > 0 ? items : products.slice(0, 3);
      })()
    : [];

  if (loading) {
    return (
      <section className="py-24 sm:py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-16" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-luxury-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <p className="luxury-label mb-3">Curated Selection</p>
            <h2 className="luxury-heading text-3xl sm:text-4xl font-light">Signature Fragrances</h2>
          </div>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wideish text-luxury-gold hover:text-luxury-gold-light transition-colors group"
          >
            View Full Collection
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={productPath(product)}
              className="group relative overflow-hidden bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/20 transition-colors duration-500"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/20 to-transparent" />

                {(product.is_limited || product.is_new) && (
                  <span className="absolute top-5 left-5 luxury-label text-luxury-gold border border-luxury-gold/30 px-3 py-1">
                    {product.is_limited ? 'Limited Edition' : 'New Arrival'}
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-xs text-luxury-gold-muted uppercase tracking-wideish mb-1">
                  {product.concentration}
                </p>
                <h3 className="luxury-heading text-xl sm:text-2xl font-medium mb-2 group-hover:text-luxury-gold-light transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-luxury-cream/60 font-light">
                  {formatCurrency(product.price)} · {product.volume_ml}ml
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
