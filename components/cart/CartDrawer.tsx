'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Check, 
  Truck,
  Flame
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingProgress,
    freeShippingRemaining,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const ok = applyCoupon(couponInput);
      if (ok) setCouponInput('');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 max-w-md w-full bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-900 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-slate-900" />
                  {freeShippingRemaining === 0 ? (
                    <strong className="text-emerald-600">🎉 Congratulations! You unlocked Free Shipping!</strong>
                  ) : (
                    <span>Add <strong className="text-slate-950">৳{freeShippingRemaining.toLocaleString()}</strong> more for FREE Shipping</span>
                  )}
                </span>
                <span className="font-bold text-slate-900">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShippingProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-slate-950 rounded-full"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Your bag is empty</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Discover our curated collection of luxury products, authentic apparel, and tech essentials.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4 group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {item.isOffer && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold tracking-wide">
                                <Flame className="w-3 h-3 text-amber-600" />
                                <span>{item.offerBadge || '🔥 Flash Deal'}</span>
                              </span>
                            )}
                            <Link
                              href={`/product/${item.slug || item.productId}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors line-clamp-1 block"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.selectedColor} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-900 min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-950">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
                {/* Subtotal & Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-slate-900">
                      {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `৳${shippingFee}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Voucher Discount</span>
                      <span className="font-semibold">-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-slate-950">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all transform active:scale-95 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
