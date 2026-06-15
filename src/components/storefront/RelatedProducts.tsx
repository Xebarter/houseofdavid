'use client';

import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

type RelatedProductsProps = {
  products: Product[];
  categoryName?: string;
};

export function RelatedProducts({ products, categoryName }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-white/5 pt-16 sm:pt-20">
      <div className="mb-10">
        <p className="luxury-label mb-3">You May Also Enjoy</p>
        <h2 className="luxury-heading text-2xl sm:text-3xl font-light">
          {categoryName ? `More from ${categoryName}` : 'Related Fragrances'}
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
