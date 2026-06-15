import type { ImageVariants } from './types';
import { IMAGE_CONFIG } from './config';

const BUCKET_HOST = 'storage.googleapis.com';

export function buildVariantUrl(basePath: string, width: number, format: 'avif' | 'webp'): string {
  return `${basePath}/${width}w.${format}`;
}

export function buildSrcSet(basePath: string, widths: number[], format: 'avif' | 'webp'): string {
  return widths.map((w) => `${buildVariantUrl(basePath, w, format)} ${w}w`).join(', ');
}

export const PRODUCT_CARD_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

export const PRODUCT_DETAIL_SIZES =
  '(max-width: 1024px) 100vw, 50vw';

export const HERO_PRODUCT_SIZES = '(max-width: 1024px) 90vw, 420px';

export const CART_THUMB_SIZES = '80px';

export function resolveImageDelivery(
  src: string,
  variants?: ImageVariants | null
): {
  src: string;
  srcSetAvif?: string;
  srcSetWebp?: string;
  srcSetFallback?: string;
  width?: number;
  height?: number;
  placeholder?: string;
} {
  if (variants?.basePath && variants.widths.length > 0) {
    const widths = variants.widths;
    return {
      src: variants.primary || buildVariantUrl(variants.basePath, widths[widths.length - 1]!, 'webp'),
      srcSetAvif: buildSrcSet(variants.basePath, widths, 'avif'),
      srcSetWebp: buildSrcSet(variants.basePath, widths, 'webp'),
      width: variants.width,
      height: variants.height,
      placeholder: variants.placeholder,
    };
  }

  return { src };
}

export function isOptimizedStorageUrl(url: string): boolean {
  return url.includes(`/${IMAGE_CONFIG.storagePrefix}/`) && /\d+w\.(webp|avif)/.test(url);
}

export function extractBasePathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(BUCKET_HOST)) return null;
    const match = parsed.pathname.match(
      new RegExp(`(/${IMAGE_CONFIG.storagePrefix}/[a-f0-9]{16,})`)
    );
    if (!match) return null;
    return `${parsed.protocol}//${parsed.host}${match[1]}`;
  } catch {
    return null;
  }
}
