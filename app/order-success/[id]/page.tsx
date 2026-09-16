'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Phone, 
  Printer, 
  Sparkles,
  ShoppingBag,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackPurchase } from '@/lib/fbpixel';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti fireworks
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch (e) {}

    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);

          const purchaseKey = `fb_purchase_${data.order.orderNumber || data.order._id}`;
          if (!sessionStorage.getItem(purchaseKey)) {
            trackPurchase({
              ids: (data.order.items || []).map((item: any) => item.productId || item.id),
              value: data.order.totalAmount,
              orderId: data.order.orderNumber || data.order._id,
            });
            sessionStorage.setItem(purchaseKey, '1');
          }
        }
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) loadOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Celebration Header Card */}
        <div className="text-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Order Successfully Placed
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Thank You for Shopping with <span className="text-slate-600 font-serif italic font-normal">HavItAll</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
            We've received your order and our fulfillment team is already preparing your package.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">Order Tracking ID:</span>
            <span className="text-base font-mono font-black text-slate-950 tracking-wider">
              {order?.orderNumber || orderId}
            </span>
          </div>
        </div>

        {/* Receipt Details Card */}
        {order && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 mb-8 shadow-sm print:bg-white print:text-black">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-950 font-display">
                Invoice & Order Breakdown
              </h2>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Recipient Details
                </span>
                <p className="font-bold text-slate-900 text-sm">{order.customer?.fullName}</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-950" /> {order.customer?.phone}
                </p>
                {order.customer?.email && (
                  <p className="text-slate-600">{order.customer?.email}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Shipping Destination
                </span>
                <p className="text-slate-700 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-950 shrink-0 mt-0.5" />
                  <span>{order.customer?.address}, {order.customer?.city}</span>
                </p>
                <p className="text-slate-600 pt-1">
                  Payment Method: <strong className="text-slate-900">{order.paymentMethod}</strong> ({order.paymentStatus})
                </p>
              </div>
            </div>

            {/* Itemized List */}
            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1"
                    />
                    <div>
                      {item.isOffer && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold tracking-wide">
                          <Flame className="w-2.5 h-2.5 text-amber-600" />
                          <span>{item.offerBadge || '🔥 Flash Deal'}</span>
                        </span>
                      )}
                      <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-950">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Math */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">৳{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `৳${order.shippingFee}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-semibold">-৳{order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-slate-950 font-bold">৳{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            href={`/track-order?id=${order?.orderNumber || orderId}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Order Status</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm border border-slate-200 transition-colors text-center shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
