'use client';

import { useState } from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Cart } from '@/components/storefront/Cart';
import { ProductDetails } from '@/components/storefront/ProductDetails';

export default function ProductPage() {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onCartClick={() => setShowCart(true)} />
      <div className="pt-16">
        <ProductDetails />
      </div>
      <Footer />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} onCheckout={() => {}} />
    </div>
  );
}
