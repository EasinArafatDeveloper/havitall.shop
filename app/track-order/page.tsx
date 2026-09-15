'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';

const ORDER_STEPS = [
  { key: 'Placed', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Processing', label: 'Packed & Ready', icon: Package },
  { key: 'Shipped', label: 'In Transit', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const { error } = useToast();

  const [orderNumberInput, setOrderNumberInput] = useState(initialId);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleSearchOrder(initialId);
    }
  }, [initialId]);

  const handleSearchOrder = async (searchId?: string) => {
    const query = (searchId || orderNumberInput).trim();
    if (!query) {
      error('Please enter your Order ID (e.g. HAV-8092)');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Track order fetch error:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2;
    if (s === 'confirmed') return 1;
    return 0; // Placed
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-slate-950" /> Real-time Logistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-950 tracking-tight">
            Live Order <span className="text-slate-600 font-serif italic font-normal">Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Enter your order tracking ID (received upon checkout or via SMS) to view real-time status.
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchOrder();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. HAV-8092 or HAV-8091)"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-900 uppercase placeholder:normal-case placeholder:text-slate-400 font-mono focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Quick Demo links */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>Try demo orders:</span>
            <button
              onClick={() => {
                setOrderNumberInput('HAV-8092');
                handleSearchOrder('HAV-8092');
              }}
              className="text-slate-900 hover:underline font-mono font-bold"
            >
              HAV-8092
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setOrderNumberInput('HAV-8091');
                handleSearchOrder('HAV-8091');
              }}
              className="text-slate-900 hover:underline font-mono font-bold"
            >
              HAV-8091
            </button>
          </div>
        </div>

        {/* Tracking Details Results */}
        {searched && !loading && !order && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Order Found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find an order matching "{orderNumberInput}". Please double check your order number or contact support.
            </p>
          </div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Progress Bar Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Tracking Number</span>
                  <h2 className="text-xl font-mono font-black text-slate-950">{order.orderNumber}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Current Status:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-900 border border-slate-200">
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* 5-Step Timeline Bar */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 z-0">
                  <div
                    className="h-full bg-slate-950 transition-all duration-700"
                    style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {ORDER_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={step.key}
                        className={`flex sm:flex-col items-center gap-3 sm:gap-2 p-3 sm:p-0 rounded-2xl sm:rounded-none ${
                          isCurrent ? 'bg-slate-100 sm:bg-transparent' : ''
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                            isCompleted
                              ? 'bg-slate-950 text-white ring-4 ring-slate-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left sm:text-center">
                          <span
                            className={`text-xs font-bold block ${
                              isCompleted ? 'text-slate-950' : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-slate-600 font-semibold block">
                              Active Stage
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Activity Logs */}
              {order.timeline && order.timeline.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detailed Milestone Activity
                  </h4>
                  <div className="space-y-2.5">
                    {order.timeline.map((t: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="w-2 h-2 rounded-full bg-slate-950 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 font-semibold">{t.status}</strong>
                            <span className="text-[11px] text-slate-500">
                              {new Date(t.time).toLocaleString()}
                            </span>
                          </div>
                          {t.note && <p className="text-slate-600 mt-0.5">{t.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items & Customer Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer & Address */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 text-xs shadow-sm">
                <h4 className="font-bold text-slate-950 text-sm">Delivery Destination</h4>
                <div className="space-y-1.5 text-slate-600">
                  <p className="font-semibold text-slate-900">{order.customer?.fullName}</p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-950" /> {order.customer?.phone}
                  </p>
                  <p className="flex items-start gap-1.5 text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-950 shrink-0 mt-0.5" />
                    <span>{order.customer?.address}, {order.customer?.city}</span>
                  </p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 text-xs shadow-sm">
                <h4 className="font-bold text-slate-950 text-sm">Order Summary</h4>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Count</span>
                    <span className="font-bold text-slate-900">{order.items?.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-bold text-slate-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="text-slate-950 font-bold">৳{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
