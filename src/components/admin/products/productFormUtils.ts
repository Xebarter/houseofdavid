import type { Product } from '@/lib/types';

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
    image_url: product.image_url,
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
  galleryUrls: string[] = []
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
    image_url: form.image_url.trim() || DEFAULT_IMAGE,
    stock: Number.isFinite(stock) ? stock : 10,
    featured: form.featured,
    is_new: form.is_new,
    is_limited: form.is_limited,
    volume_ml: Number.isFinite(volume_ml) ? volume_ml : 50,
    concentration: form.concentration || 'Eau de Parfum',
    compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
    year_launched: form.year_launched ? parseInt(form.year_launched, 10) : null,
    perfumer: form.perfumer.trim() || null,
    gallery_urls: galleryUrls,
  };
}

export function formToPreviewProduct(
  form: ProductFormData,
  galleryUrls: string[] = [],
  id = 'preview'
): Product {
  const now = new Date().toISOString();
  return {
    id,
    ...buildProductPayload(form, galleryUrls),
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
