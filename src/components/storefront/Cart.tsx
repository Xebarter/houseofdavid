'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/format';

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
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  if (!isOpen && !animatingOut) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isOpen || animatingOut ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen && !animatingOut ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleStartClosing}
      ></div>

      {/* Slide-over panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-2xl transition-transform duration-300 transform ${isOpen && !animatingOut ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-amber-50">Shopping Bag</h2>

            <button
              onClick={handleStartClosing}
              className="p-2 text-amber-50 hover:text-amber-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-amber-500" />
                <p className="text-amber-300 mt-4">Your bag is empty</p>

                <button
                  onClick={handleStartClosing}
                  className="mt-4 text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Start shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 bg-gray-800 rounded-lg p-4"
                >
                  <img
                    src={item.product.image_url || 'https://placehold.co/100'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-medium text-amber-50 line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-amber-300 text-sm">
                      {item.product.volume_ml}ml • {formatCurrency(item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="w-8 h-8 rounded-full bg-gray-700 text-amber-50 flex items-center justify-center hover:bg-gray-600 transition-colors"
                      >
                        <Minus size={16} />
                      </button>

                      {/* FIXED: Prevent quantity text from getting cropped */}
                      <span className="text-amber-50 min-w-[22px] text-center text-base">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-700 text-amber-50 flex items-center justify-center hover:bg-gray-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-amber-500 hover:text-red-500 transition-colors self-start mt-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-amber-50">Total</span>
                <span className="text-2xl font-bold text-amber-50">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold py-3 px-6 rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}