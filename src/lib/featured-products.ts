import type { Product } from './types';

export function getFeaturedProducts(products: Product[], limit = 5): Product[] {
  if (products.length === 0) return [];
  const featured = products.filter((p) => p.featured);
  if (featured.length > 0) return featured.slice(0, limit);
  return products.slice(0, Math.min(limit, 3));
}

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';
