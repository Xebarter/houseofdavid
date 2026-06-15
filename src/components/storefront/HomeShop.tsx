'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { getFeaturedProducts } from '@/lib/featured-products';
import { ProductCard } from './ProductCard';

type HomeShopProps = {
  catalog: { products: Product[]; categories: Category[] } | null;
};

const HOME_GRID_LIMIT = 9;

export function HomeShop({ catalog }: HomeShopProps) {
  const products = catalog?.products ?? [];
  const categories = catalog?.categories ?? [];
  const loading = !catalog;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const featured = getFeaturedProducts(products, 2);
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category_id === selectedCategory);
  const gridProducts = filteredProducts.slice(0, HOME_GRID_LIMIT);
  const hasMore = filteredProducts.length > HOME_GRID_LIMIT;

  return (
    <div className="bg-luxury-black">
      {/* Editorial spotlight */}
      {!loading && featured.length > 0 && (
        <section className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
            <div className="flex items-center justify-between mb-10 sm:mb-14">
              <p className="luxury-label">Signature</p>
              <Link
                href="/collections"
                className="hidden sm:inline-flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke hover:text-luxury-gold transition-colors duration-300"
              >
                View collection
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div
              className={`grid gap-8 lg:gap-10 ${
                featured.length === 1 ? 'max-w-2xl' : 'sm:grid-cols-2'
              }`}
            >
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} variant="showcase" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop grid */}
      <section id="collection" className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
            <h2 className="luxury-heading text-2xl sm:text-3xl font-light tracking-tight">
              Shop
            </h2>

            {categories.length > 0 && (
              <div className="flex gap-6 overflow-x-auto pb-1 -mx-6 px-6 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`shrink-0 text-[11px] uppercase tracking-wideish pb-1 border-b transition-colors duration-300 ${
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
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`shrink-0 text-[11px] uppercase tracking-wideish pb-1 border-b transition-colors duration-300 ${
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
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 sm:gap-x-8 sm:gap-y-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] bg-white/5 animate-pulse mb-5" />
                  <div className="h-3 w-20 bg-white/5 animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : gridProducts.length === 0 ? (
            <p className="text-center text-sm text-luxury-smoke py-16">Nothing in this category.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 sm:gap-x-8 sm:gap-y-16">
                {gridProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {(hasMore || selectedCategory === 'all') && (
                <div className="mt-16 sm:mt-20 text-center">
                  <Link href="/collections" className="luxury-btn-primary">
                    View all fragrances
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
