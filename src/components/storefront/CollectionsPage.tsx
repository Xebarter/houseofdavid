'use client';

import { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getStorefrontCatalog } from '@/lib/firestore';
import type { Product, Category } from '@/lib/types';
import { BRAND_NAME } from '@/lib/brand';
import { PERFUME_CATEGORIES } from '@/components/admin/products/productFormUtils';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import {
  sortProducts,
  filterProducts,
  enrichCategories,
  getCategoryLabel,
  COLLECTION_SORT_OPTIONS,
  type CollectionSort,
} from '@/lib/collections-utils';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Cart } from '@/components/storefront/Cart';
import { Checkout } from '@/components/storefront/Checkout';
import { ProductCard } from '@/components/storefront/ProductCard';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=2400&q=80';

function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryParam = searchParams.get('category') ?? 'all';
  const sortParam = (searchParams.get('sort') as CollectionSort) || 'newest';
  const queryParam = searchParams.get('q') ?? '';
  const inStockParam = searchParams.get('stock') === '1';
  const featuredParam = searchParams.get('featured') === '1';

  const [searchInput, setSearchInput] = useState(queryParam);

  useEffect(() => {
    getStorefrontCatalog()
      .then(({ products: p, categories: c }) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => console.error('Error loading catalog:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories;
    return PERFUME_CATEGORIES.map((c) => ({
      ...c,
      slug: c.id,
      created_at: '',
    }));
  }, [categories]);

  const categoriesWithMeta = useMemo(
    () => enrichCategories(categoryOptions, products),
    [categoryOptions, products]
  );

  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured).slice(0, 4),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, {
      categoryId: categoryParam,
      query: queryParam,
      inStockOnly: inStockParam,
      featuredOnly: featuredParam,
    });
    return sortProducts(filtered, sortParam);
  }, [products, categoryParam, queryParam, inStockParam, featuredParam, sortParam]);

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const qs = params.toString();
      router.replace(qs ? `/collections?${qs}` : '/collections', { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.replace('/collections');
    setMobileFiltersOpen(false);
  };

  const activeCategoryLabel = getCategoryLabel(categoryParam, categoryOptions, PERFUME_CATEGORIES);
  const hasActiveFilters =
    categoryParam !== 'all' ||
    queryParam ||
    inStockParam ||
    featuredParam ||
    sortParam !== 'newest';

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <Header onCartClick={() => setShowCart(true)} />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/80 via-luxury-black/60 to-luxury-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/70 via-transparent to-luxury-black/50" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
            <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke mb-8">
              <Link href="/" className="hover:text-luxury-cream transition-colors">
                Home
              </Link>
              <span className="text-luxury-gold-muted/50">/</span>
              <span className="text-luxury-cream/70">Collections</span>
            </nav>

            <p className="luxury-label mb-4">{BRAND_NAME}</p>
            <h1 className="luxury-heading text-4xl sm:text-5xl md:text-6xl font-light leading-tight max-w-3xl mb-6">
              The Complete Collection
            </h1>
            <div className="luxury-divider max-w-xs mb-6" />
            <p className="text-base sm:text-lg text-luxury-cream/70 font-light max-w-2xl leading-relaxed mb-10">
              Discover every composition in our catalog — from rare oud extractions to refined
              everyday signatures. Curated for presence, crafted for longevity.
            </p>

            {!loading && (
              <div className="flex flex-wrap gap-8 sm:gap-12">
                <div>
                  <p className="text-2xl sm:text-3xl text-luxury-cream font-light tabular-nums">
                    {products.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mt-1">
                    Fragrances
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl text-luxury-cream font-light tabular-nums">
                    {categoriesWithMeta.filter((c) => c.productCount > 0).length ||
                      categoriesWithMeta.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mt-1">
                    Families
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl text-luxury-cream font-light tabular-nums">
                    {products.filter((p) => p.featured).length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mt-1">
                    Signatures
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Category showcase — hidden when a specific category is selected */}
        {!loading && categoryParam === 'all' && !queryParam && categoriesWithMeta.length > 0 && (
          <section className="py-16 sm:py-20 bg-luxury-charcoal border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <p className="luxury-label mb-2">Browse by Family</p>
                  <h2 className="luxury-heading text-2xl sm:text-3xl font-light">
                    Fragrance Collections
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categoriesWithMeta.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => updateParams({ category: category.id })}
                    className="group relative overflow-hidden text-left border border-white/5 bg-luxury-black/40 hover:border-luxury-gold/25 transition-colors duration-500"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <OptimizedImage
                        src={category.coverImage || DEFAULT_PRODUCT_IMAGE}
                        alt={category.name}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        aspectRatio="16/10"
                        className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                      <p className="luxury-label text-[10px] mb-1">
                        {category.productCount} piece{category.productCount !== 1 ? 's' : ''}
                      </p>
                      <h3 className="luxury-heading text-xl font-medium group-hover:text-luxury-gold-light transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs text-luxury-cream/50 font-light mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured strip */}
        {!loading && featuredProducts.length > 0 && categoryParam === 'all' && !queryParam && (
          <section className="py-14 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <p className="luxury-label mb-6">Signature Selection</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Toolbar */}
        <section className="sticky top-20 z-30 bg-luxury-black/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-smoke pointer-events-none"
                  strokeWidth={1.25}
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search fragrances…"
                  className="w-full pl-10 pr-4 py-2.5 bg-luxury-charcoal/80 border border-white/10 text-sm text-luxury-cream placeholder:text-luxury-smoke focus:outline-none focus:border-luxury-gold/40 transition-colors"
                />
              </form>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((v) => !v)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-white/10 text-xs uppercase tracking-wideish text-luxury-cream/80"
                >
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={1.25} />
                  Filters
                </button>

                <select
                  value={sortParam}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="px-4 py-2.5 bg-luxury-charcoal/80 border border-white/10 text-xs uppercase tracking-wideish text-luxury-cream/80 focus:outline-none focus:border-luxury-gold/40"
                  aria-label="Sort products"
                >
                  {COLLECTION_SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <label className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wideish text-luxury-smoke cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateParams({ stock: e.target.checked ? '1' : null })}
                    className="accent-luxury-gold"
                  />
                  In stock
                </label>

                <label className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wideish text-luxury-smoke cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredParam}
                    onChange={(e) => updateParams({ featured: e.target.checked ? '1' : null })}
                    className="accent-luxury-gold"
                  />
                  Signatures
                </label>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wideish text-luxury-gold hover:text-luxury-gold-light transition-colors"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.25} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category tabs — desktop always, mobile when filters open */}
            <div
              className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block mt-4 pt-4 border-t border-white/5 lg:border-0 lg:pt-0 lg:mt-4`}
            >
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <button
                  type="button"
                  onClick={() => updateParams({ category: null })}
                  className={`text-xs uppercase tracking-wideish pb-1 border-b transition-colors ${
                    categoryParam === 'all'
                      ? 'text-luxury-gold border-luxury-gold'
                      : 'text-luxury-smoke border-transparent hover:text-luxury-cream'
                  }`}
                >
                  All ({products.length})
                </button>
                {categoryOptions.map((category) => {
                  const count = products.filter((p) => p.category_id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        updateParams({ category: category.id });
                        setMobileFiltersOpen(false);
                      }}
                      className={`text-xs uppercase tracking-wideish pb-1 border-b transition-colors ${
                        categoryParam === category.id
                          ? 'text-luxury-gold border-luxury-gold'
                          : 'text-luxury-smoke border-transparent hover:text-luxury-cream'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 sm:hidden">
                <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wideish text-luxury-smoke">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateParams({ stock: e.target.checked ? '1' : null })}
                    className="accent-luxury-gold"
                  />
                  In stock
                </label>
                <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wideish text-luxury-smoke">
                  <input
                    type="checkbox"
                    checked={featuredParam}
                    onChange={(e) => updateParams({ featured: e.target.checked ? '1' : null })}
                    className="accent-luxury-gold"
                  />
                  Signatures
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Product grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-10">
              <div>
                <h2 className="luxury-heading text-2xl sm:text-3xl font-light">
                  {activeCategoryLabel}
                </h2>
                {queryParam && (
                  <p className="text-sm text-luxury-smoke mt-1 font-light">
                    Results for &ldquo;{queryParam}&rdquo;
                  </p>
                )}
              </div>
              {!loading && (
                <p className="text-xs uppercase tracking-wideish text-luxury-gold-muted">
                  {filteredProducts.length} fragrance{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] bg-white/5 animate-pulse mb-5" />
                    <div className="h-3 w-24 bg-white/5 animate-pulse mb-2" />
                    <div className="h-4 w-40 bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 border border-white/5 bg-luxury-charcoal/30">
                <p className="luxury-heading text-xl font-light mb-3">No fragrances found</p>
                <p className="text-sm text-luxury-smoke font-light mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search term, or browse the full catalog.
                </p>
                <button type="button" onClick={clearFilters} className="luxury-btn-primary">
                  View all fragrances
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Concierge CTA */}
        <section className="border-t border-white/5 bg-luxury-charcoal py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
            <p className="luxury-label mb-4">Personal Guidance</p>
            <h2 className="luxury-heading text-2xl sm:text-3xl font-light mb-4">
              Need help choosing a signature scent?
            </h2>
            <p className="text-sm text-luxury-smoke font-light leading-relaxed mb-8">
              Our concierge team can recommend compositions based on your preferences, occasion, and
              season. Discover your next fragrance with expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/about" className="luxury-btn-ghost">
                Our Heritage
              </Link>
              <Link href="/journal" className="luxury-btn-primary min-w-[200px]">
                Read the Journal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} onCheckout={handleCheckout} />
      <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}

function CollectionsFallback() {
  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-20">
      <div className="w-10 h-10 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
    </div>
  );
}

export function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsFallback />}>
      <CollectionsContent />
    </Suspense>
  );
}
