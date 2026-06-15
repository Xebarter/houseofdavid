import type { Product } from './types';

export function productPath(product: Pick<Product, 'id'>): string {
  return `/product/${product.id}`;
}
