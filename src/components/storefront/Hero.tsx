'use client';

import Link from 'next/link';
import { BRAND_NAME, BRAND_HERO_HEADLINE, BRAND_HERO_SUBLINE } from '@/lib/brand';
import { ChevronDown } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2400&q=80';

export function Hero() {
  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/70 via-luxury-black/50 to-luxury-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/60 via-transparent to-luxury-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center pt-24 pb-32">
        <p
          className="luxury-label mb-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          {BRAND_NAME}
        </p>

        <h1
          className="luxury-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
        >
          {BRAND_HERO_HEADLINE}
        </h1>

        <div
          className="luxury-divider max-w-xs mx-auto mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        />

        <p
          className="text-base sm:text-lg text-luxury-cream/70 max-w-xl mx-auto leading-relaxed font-light opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
        >
          {BRAND_HERO_SUBLINE}
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}
        >
          <button onClick={scrollToCollection} className="luxury-btn-primary min-w-[200px]">
            Explore Collection
          </button>
          <Link href="/about" className="luxury-btn-ghost">
            Our Heritage
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={scrollToCollection}
        aria-label="Scroll to collection"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-luxury-gold-muted animate-scroll-hint"
      >
        <ChevronDown className="h-6 w-6" strokeWidth={1} />
      </button>
    </section>
  );
}
