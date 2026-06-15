'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Minus, Plus, Truck, Shield, Sparkles } from 'lucide-react';
import {
  getProductById,
  getBrandById,
  getCategoryById,
  getProductNotes,
  getRelatedProducts,
} from '@/lib/firestore';
import type { Product, Brand, Category, ProductNote } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { PRODUCT_DETAIL_SIZES } from '@/lib/images/urls';
import { RelatedProducts } from './RelatedProducts';

type ProductDetailsProps = {
  onOpenCart?: () => void;
};

type DetailTab = 'story' | 'notes' | 'details';

function ProductGallery({
  images,
  imageVariants,
  galleryVariants,
  name,
  activeIndex,
  onSelect,
}: {
  images: string[];
  imageVariants?: import('@/lib/types').ImageVariants | null;
  galleryVariants?: (import('@/lib/types').ImageVariants | null)[];
  name: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const activeImage = images[activeIndex] || DEFAULT_PRODUCT_IMAGE;
  const activeVariants =
    activeIndex === 0 ? imageVariants : galleryVariants?.[activeIndex - 1] ?? null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden border border-white/5 bg-luxury-charcoal">
        <OptimizedImage
          key={activeImage}
          src={activeImage}
          variants={activeVariants}
          alt={name}
          sizes={PRODUCT_DETAIL_SIZES}
          aspectRatio="4/5"
          priority
          className="w-full h-full"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border transition-all duration-300 ${
                index === activeIndex
                  ? 'border-luxury-gold/60 ring-1 ring-luxury-gold/30'
                  : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/25'
              }`}
            >
              <OptimizedImage
                src={url}
                variants={index === 0 ? imageVariants : galleryVariants?.[index - 1]}
                alt=""
                sizes="96px"
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FragrancePyramid({ notes }: { notes: ProductNote[] }) {
  const layers = [
    { key: 'top' as const, label: 'Top Notes', desc: 'First impression' },
    { key: 'heart' as const, label: 'Heart Notes', desc: 'The soul' },
    { key: 'base' as const, label: 'Base Notes', desc: 'Lasting trail' },
  ];

  const hasNotes = notes.length > 0;

  if (!hasNotes) {
    return (
      <p className="text-sm text-luxury-cream/50 font-light leading-relaxed">
        Fragrance note composition will be published soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {layers.map(({ key, label, desc }) => {
        const layerNotes = notes.filter((n) => n.layer === key);
        return (
          <div key={key} className="border border-white/5 bg-luxury-charcoal/40 p-6">
            <div className="mb-4">
              <p className="luxury-label text-[10px] mb-1">{desc}</p>
              <h4 className="luxury-heading text-lg font-medium">{label}</h4>
            </div>
            {layerNotes.length > 0 ? (
              <ul className="space-y-2">
                {layerNotes.map((note) => (
                  <li key={note.id} className="text-sm text-luxury-cream/70 font-light">
                    {note.note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-luxury-smoke font-light">—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 lg:py-16 animate-pulse">
      <div className="h-4 w-40 bg-white/5 mb-12" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="aspect-[4/5] bg-white/5" />
        <div className="space-y-6">
          <div className="h-4 w-24 bg-white/5" />
          <div className="h-12 w-3/4 bg-white/5" />
          <div className="h-6 w-1/2 bg-white/5" />
          <div className="h-24 w-full bg-white/5 mt-8" />
          <div className="h-12 w-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetails({ onOpenCart }: ProductDetailsProps) {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState<ProductNote[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('story');
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const productData = await getProductById(id);
      if (!productData) {
        router.push('/');
        return;
      }

      setProduct(productData);
      setQuantity(1);
      setActiveImage(0);

      const [brandData, categoryData, notesData, relatedData] = await Promise.all([
        productData.brand_id ? getBrandById(productData.brand_id) : null,
        productData.category_id ? getCategoryById(productData.category_id) : null,
        getProductNotes(id),
        productData.category_id
          ? getRelatedProducts(productData.category_id, productData.id)
          : Promise.resolve([]),
      ]);

      setBrand(brandData);
      setCategory(categoryData);
      setNotes(notesData);
      setRelated(relatedData);
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const images = useMemo(() => {
    if (!product) return [DEFAULT_PRODUCT_IMAGE];
    const gallery = product.gallery_urls?.filter(Boolean) ?? [];
    const all = [product.image_url, ...gallery].filter(Boolean) as string[];
    return [...new Set(all)];
  }, [product]);

  if (loading) return <ProductDetailsSkeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24 text-center">
        <p className="luxury-heading text-2xl mb-4">Product not found</p>
        <Link href="/" className="luxury-btn-ghost">
          Return to collection
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const maxQty = Math.max(1, product.stock);
  const savings =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const badge = product.is_limited
    ? 'Limited Edition'
    : product.is_new
      ? 'New Arrival'
      : product.featured
        ? 'Signature'
        : null;

  const handleAddToBag = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    onOpenCart?.();
  };

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'story', label: 'The Story' },
    { id: 'notes', label: 'Fragrance Notes' },
    { id: 'details', label: 'Specifications' },
  ];

  return (
    <div className="bg-luxury-black">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-4">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke">
          <Link href="/" className="hover:text-luxury-cream transition-colors">
            Home
          </Link>
          <span className="text-luxury-gold-muted/50">/</span>
          <Link href="/#collection" className="hover:text-luxury-cream transition-colors">
            Collection
          </Link>
          {category && (
            <>
              <span className="text-luxury-gold-muted/50">/</span>
              <span className="text-luxury-cream/60">{category.name}</span>
            </>
          )}
          <span className="text-luxury-gold-muted/50">/</span>
          <span className="text-luxury-cream truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-20 lg:pb-28">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wideish text-luxury-gold-muted hover:text-luxury-gold transition-colors mb-8"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <ProductGallery
            images={images}
            imageVariants={product.image_variants}
            galleryVariants={product.gallery_image_variants}
            name={product.name}
            activeIndex={activeImage}
            onSelect={setActiveImage}
          />

          <div className="lg:pt-4">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {badge && (
                <span className="luxury-label text-[10px] text-luxury-gold border border-luxury-gold/30 px-3 py-1">
                  {badge}
                </span>
              )}
              {!inStock && (
                <span className="luxury-label text-[10px] text-luxury-smoke border border-white/10 px-3 py-1">
                  Sold Out
                </span>
              )}
            </div>

            {brand && (
              <p className="text-sm uppercase tracking-wideish text-luxury-gold-muted mb-2">{brand.name}</p>
            )}

            <h1 className="luxury-heading text-4xl sm:text-5xl font-light leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-sm text-luxury-cream/60 font-light mb-6">
              {[category?.name, product.concentration, `${product.volume_ml}ml`].filter(Boolean).join(' · ')}
            </p>

            {product.short_description && (
              <p className="text-base text-luxury-cream/75 font-light leading-relaxed mb-8 max-w-lg">
                {product.short_description}
              </p>
            )}

            <div className="luxury-divider mb-8" />

            <div className="flex flex-wrap items-baseline gap-4 mb-2">
              <p className="text-3xl text-luxury-cream tracking-wide">{formatCurrency(product.price)}</p>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <p className="text-lg text-luxury-smoke line-through font-light">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                  {savings !== null && (
                    <span className="text-xs uppercase tracking-wideish text-luxury-gold border border-luxury-gold/25 px-2 py-0.5">
                      Save {savings}%
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-sm text-luxury-smoke font-light mb-8">
              {inStock
                ? product.stock <= 5
                  ? `Only ${product.stock} remaining — reserve yours today`
                  : `${product.stock} bottles available`
                : 'Currently unavailable — join the waitlist by contacting us'}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-6 mb-8">
              <span className="text-xs uppercase tracking-wideish text-luxury-smoke">Quantity</span>
              <div className="flex items-center border border-white/10">
                <button
                  type="button"
                  disabled={!inStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-luxury-cream/70 hover:text-luxury-cream disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" strokeWidth={1.25} />
                </button>
                <span className="w-12 text-center text-sm text-luxury-cream tabular-nums">{quantity}</span>
                <button
                  type="button"
                  disabled={!inStock || quantity >= maxQty}
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="p-3 text-luxury-cream/70 hover:text-luxury-cream disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.25} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="luxury-btn-primary flex-1 min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!inStock}
                className="flex-1 min-h-[52px] inline-flex items-center justify-center px-6 text-xs font-medium uppercase tracking-wideish border border-white/15 text-luxury-cream/90 hover:border-luxury-gold/40 hover:text-luxury-cream transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {added ? 'Added to Bag' : 'Add to Bag'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-white/5">
              {[
                { icon: Sparkles, label: 'Authentic', desc: 'Sourced & guaranteed' },
                { icon: Truck, label: 'Delivery', desc: 'Nationwide shipping' },
                { icon: Shield, label: 'Secure', desc: 'Protected checkout' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-luxury-gold-muted mt-0.5 flex-shrink-0" strokeWidth={1.25} />
                  <div>
                    <p className="text-xs uppercase tracking-wideish text-luxury-cream/80">{label}</p>
                    <p className="text-[11px] text-luxury-smoke font-light mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail tabs */}
        <div className="mt-20 lg:mt-28">
          <div className="flex flex-wrap gap-6 sm:gap-10 border-b border-white/5 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-xs uppercase tracking-wideish transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-luxury-cream'
                    : 'text-luxury-smoke hover:text-luxury-cream/70'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-luxury-gold" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'story' && (
            <div className="max-w-3xl">
              {product.description ? (
                <p className="text-base text-luxury-cream/75 font-light leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-luxury-cream/50 font-light">
                  A distinguished composition crafted for the modern gentleman.
                </p>
              )}
              {(product.perfumer || product.year_launched) && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
                  {product.perfumer && (
                    <p className="text-sm text-luxury-cream/60 font-light">
                      Composed by{' '}
                      <span className="text-luxury-cream italic">{product.perfumer}</span>
                    </p>
                  )}
                  {product.year_launched && (
                    <p className="text-sm text-luxury-cream/60 font-light">
                      Launched in <span className="text-luxury-cream">{product.year_launched}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && <FragrancePyramid notes={notes} />}

          {activeTab === 'details' && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-2xl">
              {[
                { label: 'Concentration', value: product.concentration },
                { label: 'Volume', value: `${product.volume_ml}ml` },
                { label: 'Category', value: category?.name },
                { label: 'Maison', value: brand?.name },
                { label: 'Perfumer', value: product.perfumer },
                { label: 'Year', value: product.year_launched?.toString() },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} className="border-b border-white/5 pb-4">
                    <dt className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">
                      {row.label}
                    </dt>
                    <dd className="text-sm text-luxury-cream/80 font-light">{row.value}</dd>
                  </div>
                ))}
            </dl>
          )}
        </div>

        <RelatedProducts products={related} categoryName={category?.name} />
      </div>
    </div>
  );
}
