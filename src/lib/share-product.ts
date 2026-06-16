import type { Product } from '@/lib/types';
import { productPath } from '@/lib/product-routes';
import { BRAND_NAME } from '@/lib/brand';
import { getSiteUrl } from '@/lib/site';

export type ShareProductResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function productShareUrl(product: Pick<Product, 'id'>): string {
  return `${getSiteUrl()}${productPath(product)}`;
}

export async function shareProduct(
  product: Pick<Product, 'id' | 'name'>
): Promise<ShareProductResult> {
  const url = productShareUrl(product);
  const title = product.name;
  const text = `Discover ${product.name} at ${BRAND_NAME}`;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
