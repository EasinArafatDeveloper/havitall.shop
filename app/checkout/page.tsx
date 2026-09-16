'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Flame
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { trackInitiateCheckout } from '@/lib/fbpixel';

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

  useEffect(() => {
    if (cart.length > 0) {
      trackInitiateCheckout({
        ids: cart.map((item) => item.productId),
        value: total,
        numItems: cart.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-950 mb-2 font-display">Your Cart is Empty</h2>
        <p className="text-xs text-slate-600 max-w-sm mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
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
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/shop"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-950 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
              Secure <span className="text-slate-600 font-serif italic font-normal">Checkout</span>
            </h1>
            <p className="text-xs text-slate-500">Complete your order with verified privacy and encryption.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Customer Information & Delivery Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Contact & Shipping Address Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 border border-slate-200 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-base font-bold text-slate-950 font-display">
                  Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address (For Invoice)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. tanvir@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    City / Region <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-950"
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
                  <label className="text-xs font-semibold text-slate-700">
                    Full Delivery Address <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House, Road, Block/Area, Landmark..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Order Note / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please call before reaching gate"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 border border-slate-200 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-950 font-display">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-slate-50 border-slate-950 ring-1 ring-slate-950'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-slate-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-950 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Popular
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay cash when you receive and inspect your package at your doorstep.
                    </p>
                  </div>
                </label>

                {/* bKash */}
                <label
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'BKASH'
                      ? 'bg-slate-50 border-slate-950 ring-1 ring-slate-950'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BKASH'}
                    onChange={() => setPaymentMethod('BKASH')}
                    className="mt-1 accent-slate-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-950 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-pink-600" /> bKash Mobile Payment
                      </span>
                      <span className="text-xs font-bold text-pink-600">bKash Direct</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Instant payment via bKash personal or merchant gateway.
                    </p>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'NAGAD'
                      ? 'bg-slate-50 border-slate-950 ring-1 ring-slate-950'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'NAGAD'}
                    onChange={() => setPaymentMethod('NAGAD')}
                    className="mt-1 accent-slate-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-950 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-amber-600" /> Nagad Payment
                      </span>
                      <span className="text-xs font-bold text-amber-600">Nagad Direct</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fast mobile banking checkout with Nagad wallet.
                    </p>
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-slate-50 border-slate-950 ring-1 ring-slate-950'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="mt-1 accent-slate-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-950 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" /> Credit / Debit Card (Visa / Mastercard)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      256-bit encrypted SSL secure payment gateway.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 sticky top-24 shadow-sm">
              <h2 className="text-base font-bold text-slate-950 font-display pb-4 border-b border-slate-100">
                Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {item.isOffer && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold tracking-wide">
                          <Flame className="w-2.5 h-2.5 text-amber-600" />
                          <span>{item.offerBadge || '🔥 Flash Deal'}</span>
                        </span>
                      )}
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-950 shrink-0">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee === 0 ? <strong className="text-emerald-600">FREE SHIPPING</strong> : `৳${shippingFee}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-100">
                  <span>Total Payable</span>
                  <span className="text-slate-950 text-lg">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
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

              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Guaranteed Safe & Secure Checkout
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
