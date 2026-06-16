'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';
import { productPath } from '@/lib/product-routes';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/featured-products';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CART_THUMB_SIZES } from '@/lib/images/urls';
import type { CheckoutCustomerInput } from '@/lib/types';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  location: '',
};

const inputClassName =
  'w-full min-h-[48px] px-4 py-3 text-base bg-gray-800 border border-gray-700 rounded-xl text-amber-50 placeholder:text-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-500';

function buildCustomerPayload(form: typeof EMPTY_FORM): CheckoutCustomerInput {
  const phoneDigits = form.phone.replace(/\D/g, '');
  const location = form.location.trim();

  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    address: location,
    city: location,
    postalCode: '',
    country: 'Uganda',
    email: phoneDigits ? `customer+${phoneDigits}@houseofdavid.ug` : 'customer@houseofdavid.ug',
  };
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paytota' | 'cash'>('paytota');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const total = getTotalPrice();

  const buildOrderPayload = () => ({
    customer: buildCustomerPayload(formData),
    items,
    total_amount: total,
  });

  const resetForm = () => setFormData(EMPTY_FORM);

  const handlePaytotaPayment = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/paytota/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buildOrderPayload(),
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit payment');
      }

      const data = await response.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error('Failed to get checkout URL from Paytota');
      }
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to place order: ${message}. Please check your information and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOrderPayload()),
      });

      if (!response.ok) throw new Error('Failed to create order');

      setOrderPlaced(true);
      clearCart();

      setTimeout(() => {
        setOrderPlaced(false);
        onClose();
        resetForm();
      }, 4000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'paytota') {
      handlePaytotaPayment(e);
    } else {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  if (orderPlaced) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-t-3xl sm:rounded-2xl shadow-2xl p-8 max-w-md w-full border-t sm:border border-amber-900/50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 mb-4">
                <Check className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-amber-50 mb-4">Order Confirmed</h2>
              <p className="text-amber-100 mb-6">
                Thank you for your purchase. We will contact you when your order is on the way.
              </p>
              <button
                onClick={onClose}
                className="w-full min-h-[48px] px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border-t sm:border border-amber-900/50 flex flex-col max-h-[100dvh] sm:max-h-[90dvh]">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-amber-900/30 shrink-0">
            <h2 className="text-xl font-bold text-amber-50">Checkout</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close checkout"
              className="w-10 h-10 flex items-center justify-center rounded-full text-amber-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handlePlaceOrder} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80 mb-3">
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paytota')}
                    className={`min-h-[72px] p-4 rounded-xl border-2 text-left transition-colors ${
                      paymentMethod === 'paytota'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700 hover:border-amber-500/60'
                    }`}
                  >
                    <div className="font-medium text-amber-50">Pay with Paytota</div>
                    <div className="text-sm text-amber-200 mt-1">Card &amp; mobile money</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`min-h-[72px] p-4 rounded-xl border-2 text-left transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700 hover:border-amber-500/60'
                    }`}
                  >
                    <div className="font-medium text-amber-50">Cash on Delivery</div>
                    <div className="text-sm text-amber-200 mt-1">Pay when you receive</div>
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80 mb-3">
                  Your Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-amber-100 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClassName}
                      placeholder="Jane Rose"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-amber-100 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClassName}
                      placeholder="0770 123 456"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-amber-100 text-sm font-medium mb-2">
                      Delivery Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      autoComplete="street-address"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={inputClassName}
                      placeholder="Ntinda, Kampala"
                      required
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                      <Link
                        href={productPath(item.product)}
                        onClick={onClose}
                        className="block w-14 h-14 shrink-0 relative overflow-hidden rounded-lg"
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
                          onClick={onClose}
                          className="font-medium text-amber-50 hover:text-amber-300 transition-colors line-clamp-2 text-sm"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-amber-200 text-xs mt-0.5">
                          {item.product.volume_ml}ml × {item.quantity}
                        </p>
                      </div>
                      <div className="text-amber-50 font-medium text-sm shrink-0">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-amber-900/50 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-200">Subtotal</span>
                    <span className="text-amber-50">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-200">Shipping</span>
                    <span className="text-amber-50">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-amber-50 font-bold text-lg">Total</span>
                    <span className="text-amber-50 font-bold text-xl">{formatCurrency(total)}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-amber-900/30 bg-gray-900/80 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-base py-4 px-6 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Processing Order...'
                  : paymentMethod === 'paytota'
                    ? `Pay ${formatCurrency(total)}`
                    : `Place Order · ${formatCurrency(total)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
