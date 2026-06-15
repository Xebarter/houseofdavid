import type { Product, Category } from './types';

export type CollectionSort = 'newest' | 'price-asc' | 'price-desc' | 'name';

export const COLLECTION_SORT_OPTIONS: { value: CollectionSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

export function sortProducts(products: Product[], sort: CollectionSort): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
    default:
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

export function filterProducts(
  products: Product[],
  options: {
    categoryId?: string;
    query?: string;
    inStockOnly?: boolean;
    featuredOnly?: boolean;
  }
): Product[] {
  const q = options.query?.trim().toLowerCase() ?? '';

  return products.filter((p) => {
    if (options.categoryId && options.categoryId !== 'all' && p.category_id !== options.categoryId) {
      return false;
    }
    if (options.inStockOnly && p.stock <= 0) return false;
    if (options.featuredOnly && !p.featured) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.short_description.toLowerCase().includes(q) ||
      p.concentration.toLowerCase().includes(q)
    );
  });
}

export type CategoryWithMeta = Category & {
  productCount: number;
  coverImage?: string;
};

export function enrichCategories(
  categories: Category[],
  products: Product[]
): CategoryWithMeta[] {
  return categories.map((category) => {
    const inCategory = products.filter((p) => p.category_id === category.id);
    const cover =
      inCategory.find((p) => p.featured && p.image_url)?.image_url ||
      inCategory[0]?.image_url;
    return {
      ...category,
      productCount: inCategory.length,
      coverImage: cover,
    };
  });
}

export function getCategoryLabel(
  categoryId: string,
  categories: Category[],
  fallback: { id: string; name: string }[] = []
): string {
  if (categoryId === 'all') return 'All Fragrances';
  const fromDb = categories.find((c) => c.id === categoryId);
  if (fromDb) return fromDb.name;
  return fallback.find((c) => c.id === categoryId)?.name ?? 'Collection';
}
