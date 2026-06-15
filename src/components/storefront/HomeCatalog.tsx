'use client';

import { useState, useEffect } from 'react';
import { getStorefrontCatalog } from '@/lib/firestore';
import type { Product, Category } from '@/lib/types';
import { FeaturedCollection } from './FeaturedCollection';
import { ProductGrid } from './ProductGrid';

export function HomeCatalog() {
  const [catalog, setCatalog] = useState<{ products: Product[]; categories: Category[] } | null>(null);

  useEffect(() => {
    getStorefrontCatalog()
      .then(setCatalog)
      .catch((err) => console.error('Error loading catalog:', err));
  }, []);

  return (
    <>
      <FeaturedCollection products={catalog?.products} loading={!catalog} />
      <ProductGrid products={catalog?.products} categories={catalog?.categories} loading={!catalog} />
    </>
  );
}
