'use client';

import type { Product, Category } from '@/lib/types';
import { ProductGrid } from './ProductGrid';

type HomeCatalogProps = {
  catalog: { products: Product[]; categories: Category[] } | null;
};

export function HomeCatalog({ catalog }: HomeCatalogProps) {
  return (
    <ProductGrid
      products={catalog?.products}
      categories={catalog?.categories}
      loading={!catalog}
    />
  );
}
