import type { Product } from '@/lib/types';
import type { ImageVariants } from '@/lib/images/types';

export const PERFUME_CATEGORIES = [
  { id: 'floral', name: 'Floral', description: '' },
  { id: 'woody', name: 'Woody', description: '' },
  { id: 'oriental', name: 'Oriental', description: '' },
  { id: 'fresh', name: 'Fresh', description: '' },
  { id: 'oud', name: 'Oud', description: '' },
  { id: 'niche', name: 'Niche', description: '' },
];

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';

const PLACEHOLDER_IMAGE_ID = 'photo-1594035910387-fea47794261f';

/** True when the URL is empty or the built-in stock placeholder (not a user upload). */
export function isPlaceholderImage(url: string | undefined | null): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return true;
  return trimmed === DEFAULT_IMAGE || trimmed.includes(PLACEHOLDER_IMAGE_ID);
}

/** Preview-only fallback for storefront and admin thumbnails. Never persist this as product data. */
export function getDisplayImageUrl(url: string | undefined | null): string {
  return isPlaceholderImage(url) ? DEFAULT_IMAGE : url!.trim();
}

/** Normalize a stored image URL for forms (treat placeholders as empty). */
export function normalizeFormImageUrl(url: string | undefined | null): string {
  return isPlaceholderImage(url) ? '' : url!.trim();
}

export const CONCENTRATIONS = [
  'Eau de Cologne',
  'Eau de Toilette',
  'Eau de Parfum',
  'Parfum',
  'Extrait de Parfum',
] as const;

export type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  brand_id: string;
  image_url: string;
  stock: string;
  featured: boolean;
  is_new: boolean;
  is_limited: boolean;
  volume_ml: string;
  concentration: string;
  year_launched: string;
  perfumer: string;
};

export function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function makeEmptyForm(defaultCategoryId: string, defaultBrandId = ''): ProductFormData {
  return {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    compare_at_price: '',
    category_id: defaultCategoryId,
    brand_id: defaultBrandId,
    image_url: '',
    stock: '10',
    featured: false,
    is_new: true,
    is_limited: false,
    volume_ml: '50',
    concentration: 'Eau de Parfum',
    year_launched: '',
    perfumer: '',
  };
}

export function productToForm(product: Product, defaultCategoryId: string, defaultBrandId = ''): ProductFormData {
  return {
    name: product.name,
    slug: product.slug || '',
    description: product.description,
    short_description: product.short_description || '',
    price: product.price.toString(),
    compare_at_price: product.compare_at_price?.toString() || '',
    category_id: product.category_id || defaultCategoryId,
    brand_id: product.brand_id || defaultBrandId,
    image_url: normalizeFormImageUrl(product.image_url),
    stock: product.stock.toString(),
    featured: product.featured,
    is_new: product.is_new,
    is_limited: product.is_limited,
    volume_ml: product.volume_ml?.toString() || '50',
    concentration: product.concentration || 'Eau de Parfum',
    year_launched: product.year_launched?.toString() || '',
    perfumer: product.perfumer || '',
  };
}

export function validateProductForm(form: ProductFormData): string | null {
  if (!form.name.trim()) return 'Product name is required';
  if (!form.category_id) return 'Select a category';
  const price = parseFloat(form.price);
  if (!Number.isFinite(price) || price <= 0) return 'Enter a valid price greater than zero';
  return null;
}

export function buildProductPayload(
  form: ProductFormData,
  galleryUrls: string[] = [],
  imageVariants: ImageVariants | null = null,
  galleryImageVariants: (ImageVariants | null)[] = []
): Omit<Product, 'id' | 'created_at' | 'updated_at'> {
  const price = parseFloat(form.price);
  const stock = parseInt(form.stock, 10);
  const volume_ml = parseInt(form.volume_ml, 10);

  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim(),
    short_description: form.short_description.trim(),
    price: Number.isFinite(price) ? price : 0,
    category_id: form.category_id,
    brand_id: form.brand_id || '',
    image_url: normalizeFormImageUrl(form.image_url),
    image_variants: imageVariants,
    stock: Number.isFinite(stock) ? stock : 10,
    featured: form.featured,
    is_new: form.is_new,
    is_limited: form.is_limited,
    volume_ml: Number.isFinite(volume_ml) ? volume_ml : 50,
    concentration: form.concentration || 'Eau de Parfum',
    compare_at_price: (() => {
      const raw = form.compare_at_price.trim();
      if (!raw) return null;
      const value = parseFloat(raw);
      return Number.isFinite(value) ? value : null;
    })(),
    year_launched: (() => {
      const raw = form.year_launched.trim();
      if (!raw) return null;
      const value = parseInt(raw, 10);
      return Number.isFinite(value) ? value : null;
    })(),
    perfumer: form.perfumer.trim() || null,
    gallery_urls: galleryUrls.filter((url) => !isPlaceholderImage(url)),
    gallery_image_variants: galleryImageVariants.length > 0 ? galleryImageVariants : undefined,
  };
}

export function formToPreviewProduct(
  form: ProductFormData,
  galleryUrls: string[] = [],
  id = 'preview',
  imageVariants: ImageVariants | null = null
): Product {
  const now = new Date().toISOString();
  return {
    id,
    ...buildProductPayload(form, galleryUrls, imageVariants),
    created_at: now,
    updated_at: now,
  };
}

import type { Dispatch, SetStateAction } from 'react';

export function startSaveProgressTicker(setProgress: Dispatch<SetStateAction<number | null>>) {
  setProgress(10);
  const interval = setInterval(() => {
    setProgress((current) => (current !== null && current < 90 ? current + 5 : current));
  }, 40);
  return interval;
}
