'use client';

import { useState } from 'react';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products?: Product[];
  categories?: Category[];
  loading?: boolean;
}

export function ProductGrid({ products = [], categories = [], loading = false }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category_id === selectedCategory);

  return (
    <section id="collection" className="py-24 sm:py-32 bg-luxury-charcoal border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="luxury-label mb-4">The Collection</p>
          <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl font-light mb-6">
            Explore Our Fragrances
          </h2>
          <p className="text-sm text-luxury-smoke font-light leading-relaxed">
            Each bottle represents a distinct chapter in the art of masculine perfumery —
            from bold orientals to refined woody compositions.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-14 border-b border-white/5 pb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs uppercase tracking-wideish pb-1 border-b transition-colors duration-300 ${
                selectedCategory === 'all'
                  ? 'text-luxury-gold border-luxury-gold'
                  : 'text-luxury-smoke border-transparent hover:text-luxury-cream'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-xs uppercase tracking-wideish pb-1 border-b transition-colors duration-300 ${
                  selectedCategory === category.id
                    ? 'text-luxury-gold border-luxury-gold'
                    : 'text-luxury-smoke border-transparent hover:text-luxury-cream'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-white/5 animate-pulse mb-5" />
                <div className="h-3 w-24 bg-white/5 animate-pulse mb-2" />
                <div className="h-4 w-40 bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-smoke text-sm">No fragrances in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
