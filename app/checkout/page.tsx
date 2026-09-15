'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Lock, 
  ArrowLeft, 
  Check, 
  ShoppingBag, 
  Tag,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cart, 
    subtotal, 
    shippingFee, 
    discount, 
    total, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    clearCart 
  } = useCart();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Dhaka',
    address: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'CARD'>('COD');
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-dark-200 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      error('Please fill in your name, phone number, and delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          subtotal,
          shippingFee,
          discount,
          totalAmount: total,
          couponCode: appliedCoupon || '',
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        success('Order placed successfully! 🎉');
        clearCart();
        router.push(`/order-success/${data.order.orderNumber || data.order._id}`);
      } else {
        error(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      error('Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-200 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/shop"
            className="p-2 rounded-xl bg-dark-100 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Secure <span className="text-gradient-brand">Checkout</span>
            </h1>
            <p className="text-xs text-slate-400">Complete your order with verified privacy and encryption.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Customer Information & Delivery Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Contact & Shipping Address Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-dark-100 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-base font-bold text-white font-display">
                  Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address (For Invoice)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. tanvir@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    City / Region <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Dhaka">Dhaka City (Inside Dhaka - 24-48h)</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Other">Outside Dhaka</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House, Road, Block/Area, Landmark..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Order Note / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please call before reaching gate"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-dark-100 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-base font-bold text-white font-display">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-rose-600/10 border-rose-500 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-400" /> Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] uppercase font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        Popular
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pay cash when you receive and inspect your package at your doorstep.
                    </p>
                  </div>
                </label>

                {/* bKash */}
                <label
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'BKASH'
                      ? 'bg-rose-600/10 border-rose-500 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BKASH'}
                    onChange={() => setPaymentMethod('BKASH')}
                    className="mt-1 accent-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-pink-500" /> bKash Mobile Payment
                      </span>
                      <span className="text-xs font-bold text-pink-400">bKash Merchant</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Instant online payment via bKash personal or merchant gateway.
                    </p>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'NAGAD'
                      ? 'bg-rose-600/10 border-rose-500 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'NAGAD'}
                    onChange={() => setPaymentMethod('NAGAD')}
                    className="mt-1 accent-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-amber-500" /> Nagad Payment
                      </span>
                      <span className="text-xs font-bold text-amber-400">Nagad Direct</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fast mobile banking checkout with Nagad wallet.
                    </p>
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-rose-600/10 border-rose-500 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="mt-1 accent-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-sky-400" /> Credit / Debit Card (Visa / Mastercard)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      256-bit encrypted SSL payment gateway.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-dark-100 border border-slate-800 space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-white font-display pb-4 border-b border-slate-800">
                Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-rose-400 shrink-0">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Box */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Promo Code (HAVITALL20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-rose-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg mt-2">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Coupon "{appliedCoupon}" applied
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-white underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? <strong className="text-emerald-400">FREE SHIPPING</strong> : `৳${shippingFee}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-slate-800">
                  <span>Total Payable</span>
                  <span className="text-gradient-brand text-lg">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-rose-950 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order (৳{total.toLocaleString()})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Guaranteed Safe & Secure Checkout
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
