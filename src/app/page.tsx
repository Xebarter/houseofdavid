'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/storefront/Header';
import { Hero } from '@/components/storefront/Hero';
import { HomeShop } from '@/components/storefront/HomeShop';
import { Cart } from '@/components/storefront/Cart';
import { Checkout } from '@/components/storefront/Checkout';
import { Footer } from '@/components/storefront/Footer';
import { getStorefrontCatalog } from '@/lib/firestore';
import type { Product, Category } from '@/lib/types';

export default function HomePage() {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [catalog, setCatalog] = useState<{ products: Product[]; categories: Category[] } | null>(
    null
  );

  useEffect(() => {
    getStorefrontCatalog()
      .then(setCatalog)
      .catch((err) => console.error('Error loading catalog:', err));
  }, []);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <Header onCartClick={() => setShowCart(true)} />
      <main>
        <Hero
          products={catalog?.products}
          loading={!catalog}
          onOpenCart={() => setShowCart(true)}
        />
        <HomeShop catalog={catalog} />
      </main>
      <Footer />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={handleCheckout}
      />
      <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}
