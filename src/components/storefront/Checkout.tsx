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

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paytota' | 'cash'>('paytota');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'paytota') {
      handlePaytotaPayment(e);
    } else {
      handleSubmit(e);
    }
  };

  const calculateTotal = () =>
    items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const buildOrderPayload = () => ({
    customer: formData,
    items,
    total_amount: getTotalPrice(),
  });

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
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          country: '',
        });
      }, 4000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (orderPlaced) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-8 max-w-md w-full my-8 border border-amber-900/50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 mb-4">
                <Check className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-amber-50 mb-4">Order Confirmed</h2>
              <p className="text-amber-100 mb-6">
                Thank you for your purchase. A confirmation has been sent to your email.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-none sm:rounded-2xl shadow-2xl max-w-2xl w-full my-0 sm:my-8 border-0 sm:border border-amber-900/50 flex flex-col h-screen sm:h-auto">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-50">Checkout</h2>
              <button type="button" onClick={onClose} className="text-amber-500 hover:text-amber-300 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-amber-50 mb-4 border-b border-amber-900/50 pb-2">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paytota')}
                  className={`p-4 rounded-lg border-2 ${
                    paymentMethod === 'paytota'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 hover:border-amber-500'
                  }`}
                >
                  <div className="font-medium text-amber-50">Pay with Paytota</div>
                  <div className="text-sm text-amber-200">Card, Mobile Money, and more</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 ${
                    paymentMethod === 'cash'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 hover:border-amber-500'
                  }`}
                >
                  <div className="font-medium text-amber-50">Cash on Delivery</div>
                  <div className="text-sm text-amber-200">Pay when you receive your order</div>
                </button>
              </div>
            </div>

            <form
              onSubmit={handlePlaceOrder}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-2"
            >
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-amber-50 mb-4 border-b border-amber-900/50 pb-2">
                  Shipping Information
                </h3>
              </div>

              {[
                { id: 'name', label: 'Full Name', type: 'text' },
                { id: 'email', label: 'Email Address', type: 'email' },
                { id: 'phone', label: 'Phone Number', type: 'tel' },
                { id: 'address', label: 'Street Address', type: 'text' },
                { id: 'city', label: 'City', type: 'text' },
                { id: 'postalCode', label: 'Postal Code', type: 'text' },
              ].map(({ id, label, type }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-amber-100 text-sm font-medium mb-2">
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-amber-100 text-sm font-medium mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <h3 className="text-lg font-semibold text-amber-50 mb-4 border-b border-amber-900/50 pb-2">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <Link href={productPath(item.product)} onClick={onClose} className="block w-16 h-16 relative overflow-hidden rounded">
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
                          className="font-medium text-amber-50 hover:text-amber-300 transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-amber-200 text-sm">
                          {item.product.volume_ml}ml • {formatCurrency(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-amber-50 font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-amber-900/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-200">Subtotal</span>
                    <span className="text-amber-50">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-200">Shipping</span>
                    <span className="text-amber-50">Free</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-900/50">
                    <span className="text-amber-50 font-bold text-lg">Total</span>
                    <span className="text-amber-50 font-bold text-xl">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-4 px-6 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading
                    ? 'Processing Order...'
                    : paymentMethod === 'paytota'
                      ? 'Proceed to Payment'
                      : 'Complete Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
