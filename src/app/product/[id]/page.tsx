'use client';

import { useState } from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Cart } from '@/components/storefront/Cart';
import { Checkout } from '@/components/storefront/Checkout';
import { ProductDetails } from '@/components/storefront/ProductDetails';

export default function ProductPage() {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <Header onCartClick={() => setShowCart(true)} />
      <main className="pt-20">
        <ProductDetails onOpenCart={() => setShowCart(true)} />
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
