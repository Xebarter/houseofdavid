'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BRAND_NAME, BRAND_HERO_HEADLINE, BRAND_HERO_SUBLINE } from '@/lib/brand';
import { ChevronDown } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getFeaturedProducts } from '@/lib/featured-products';
import { HeroFeaturedCarousel } from './HeroFeaturedCarousel';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2400&q=80';

type HeroProps = {
  products?: Product[];
  loading?: boolean;
  onOpenCart?: () => void;
};

export function Hero({ products = [], loading = false, onOpenCart }: HeroProps) {
  const featured = useMemo(() => getFeaturedProducts(products), [products]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const showCarousel = !loading && featured.length > 0;

  useEffect(() => {
    if (featured[0]) setActiveProduct(featured[0]);
  }, [featured]);

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  const backgroundImage =
    activeProduct?.image_variants?.primary ||
    activeProduct?.image_url ||
    HERO_IMAGE;

  return (
    <section className="relative lg:min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-slow-zoom transition-opacity duration-1000"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        {showCarousel && activeProduct?.image_url && (
          <div
            key={activeProduct.id}
            className="absolute inset-0 bg-cover bg-center animate-hero-bg-fade"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/80 via-luxury-black/55 to-luxury-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/75 via-luxury-black/35 to-luxury-black/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(201,169,98,0.08),transparent_55%)]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-16 sm:pt-28 sm:pb-24 lg:pb-24">
        <div
          className={`grid gap-8 sm:gap-12 lg:gap-16 items-center ${
            showCarousel ? 'lg:grid-cols-[1fr_minmax(320px,420px)]' : 'max-w-5xl mx-auto text-center'
          }`}
        >
          <div className={showCarousel ? 'text-left order-1' : 'text-center'}>
            <p
              className="luxury-label mb-4 sm:mb-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              {BRAND_NAME}
            </p>

            <h1
              className={`luxury-heading font-light leading-[1.08] tracking-tight mb-6 sm:mb-8 opacity-0 animate-fade-in-up ${
                showCarousel
                  ? 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl'
                  : 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl'
              }`}
              style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
            >
              {BRAND_HERO_HEADLINE}
            </h1>

            <div
              className={`luxury-divider mb-6 sm:mb-8 opacity-0 animate-fade-in-up ${
                showCarousel ? 'max-w-xs' : 'max-w-xs mx-auto'
              }`}
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            />

            <p
              className={`text-sm sm:text-lg text-luxury-cream/70 leading-relaxed font-light opacity-0 animate-fade-in-up ${
                showCarousel ? 'max-w-lg' : 'max-w-xl mx-auto'
              }`}
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
            >
              {BRAND_HERO_SUBLINE}
            </p>

            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-8 mt-8 sm:mt-10 opacity-0 animate-fade-in-up ${
                showCarousel ? 'sm:justify-start' : 'justify-center'
              }`}
              style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}
            >
              <Link href="/collections" className="luxury-btn-primary w-full sm:w-auto sm:min-w-[200px]">
                Explore Collection
              </Link>
              <Link href="/about" className="luxury-btn-ghost w-full sm:w-auto justify-center">
                Our Heritage
              </Link>
            </div>
          </div>

          {loading && (
            <div
              className="opacity-0 animate-fade-in-up w-full max-w-md lg:max-w-none mx-auto order-2"
              style={{ animationDelay: '0.75s', animationFillMode: 'forwards' }}
            >
              <div className="border border-white/10 bg-luxury-black/40 backdrop-blur-xl p-4 sm:p-8">
                <div className="h-3 w-28 bg-white/5 rounded animate-pulse mb-4 sm:mb-6" />
                <div className="aspect-[3/4] sm:aspect-[4/5] bg-white/5 animate-pulse mb-4 sm:mb-6" />
                <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse mb-3" />
                <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse mb-4 sm:mb-6" />
                <div className="flex gap-3">
                  <div className="h-12 flex-1 bg-white/5 animate-pulse" />
                  <div className="h-12 flex-1 bg-white/5 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {showCarousel && (
            <div
              className="opacity-0 animate-fade-in-up order-2"
              style={{ animationDelay: '0.75s', animationFillMode: 'forwards' }}
            >
              <HeroFeaturedCarousel
                products={featured}
                onOpenCart={onOpenCart}
                onActiveProductChange={setActiveProduct}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={scrollToCollection}
        aria-label="Scroll to collection"
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-luxury-gold-muted animate-scroll-hint z-10 hidden sm:block"
      >
        <ChevronDown className="h-6 w-6" strokeWidth={1} />
      </button>
    </section>
  );
}
