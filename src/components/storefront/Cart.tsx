'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';
import { productPath } from '@/lib/product-routes';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CART_THUMB_SIZES } from '@/lib/images/urls';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items: cartItems, removeFromCart, updateQuantity } = useCart();
  const [animatingOut, setAnimatingOut] = useState(false);

  const handleStartClosing = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setAnimatingOut(false);
      onClose();
    }, 300);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  if (!isOpen && !animatingOut) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen || animatingOut ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          isOpen && !animatingOut ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleStartClosing}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-luxury-charcoal border-l border-white/5 shadow-2xl transition-transform duration-300 transform ${
          isOpen && !animatingOut ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="luxury-heading text-lg font-medium text-luxury-cream">Shopping Bag</h2>
            <button
              onClick={handleStartClosing}
              className="p-2 text-luxury-cream/60 hover:text-luxury-cream transition-colors"
              aria-label="Close cart"
            >
              <X size={20} strokeWidth={1.25} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="mx-auto h-10 w-10 text-luxury-gold-muted" strokeWidth={1.25} />
                <p className="text-luxury-smoke mt-4 text-sm font-light">Your bag is empty</p>
                <button
                  onClick={handleStartClosing}
                  className="mt-6 luxury-btn-ghost text-xs"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 border border-white/5 bg-luxury-black/40 p-4"
                >
                  <Link
                    href={productPath(item.product)}
                    onClick={handleStartClosing}
                    className="flex-shrink-0 w-16 h-20 relative overflow-hidden border border-white/5"
                  >
                    <OptimizedImage
                      src={item.product.image_url || DEFAULT_PRODUCT_IMAGE}
                      variants={item.product.image_variants}
                      alt={item.product.name}
                      sizes={CART_THUMB_SIZES}
                      className="w-full h-full"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={productPath(item.product)}
                      onClick={handleStartClosing}
                      className="luxury-heading text-sm font-medium text-luxury-cream hover:text-luxury-gold-light transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-luxury-smoke text-xs mt-1 font-light">
                      {item.product.volume_ml}ml · {formatCurrency(item.product.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-7 h-7 border border-white/10 text-luxury-cream/70 flex items-center justify-center hover:border-luxury-gold/30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} strokeWidth={1.25} />
                      </button>
                      <span className="text-luxury-cream min-w-[20px] text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 border border-white/10 text-luxury-cream/70 flex items-center justify-center hover:border-luxury-gold/30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} strokeWidth={1.25} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-luxury-smoke hover:text-red-400/80 transition-colors self-start"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} strokeWidth={1.25} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-white/5 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wideish text-luxury-smoke">Total</span>
                <span className="text-xl text-luxury-cream tracking-wide">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <button onClick={onCheckout} className="luxury-btn-primary w-full min-h-[48px]">
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
