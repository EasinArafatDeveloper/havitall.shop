'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ArrowRight, Sparkles, Flame, ShoppingBag, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface OfferItem {
  _id?: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  posterImage?: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  title: string;
  subtitle?: string;
  badgeText: string;
  buttonText?: string;
  couponCode?: string;
  endDate: string;
  isActive: boolean;
  showAsPopup?: boolean;
}

interface DealOfTheDayProps {
  initialOffers?: OfferItem[];
}

export default function DealOfTheDay({ initialOffers }: DealOfTheDayProps) {
  const { addToCart } = useCart();
  const [offers, setOffers] = useState<OfferItem[]>(initialOffers || []);

  // Countdown timers per offer ID
  const [timeRemaining, setTimeRemaining] = useState<{
    [key: string]: { hours: number; minutes: number; seconds: number };
  }>({});

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/offers?dealOnly=true');
        const data = await res.json();
        if (data.success && data.offers) {
          setOffers(data.offers.slice(0, 2));
        }
      } catch (e) {
        console.error('Error fetching live offers:', e);
      }
    }

    if (!initialOffers || initialOffers.length === 0) {
      fetchOffers();
    }
  }, [initialOffers]);

  useEffect(() => {
    const updateCountdown = () => {
      const newTimers: { [key: string]: { hours: number; minutes: number; seconds: number } } = {};

      offers.forEach((offer, idx) => {
        const end = offer.endDate ? new Date(offer.endDate).getTime() : Date.now() + 86400000;
        const diff = Math.max(0, end - Date.now());

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        newTimers[offer._id || `offer_${idx}`] = { hours, minutes, seconds };
      });

      setTimeRemaining(newTimers);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [offers]);

  const handleAddToCart = (offer: OfferItem) => {
    const prod = {
      _id: offer.productId,
      name: offer.productName,
      slug: offer.productSlug,
      price: offer.offerPrice,
      originalPrice: offer.originalPrice,
      images: [offer.productImage || offer.posterImage || ''],
      stock: 15,
      isOffer: true,
      offerBadge: offer.badgeText || '🔥 Flash Deal',
    };
    addToCart(prod, 1, undefined, undefined, true, offer.badgeText || '🔥 Flash Deal');
  };

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-50/50 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-amber-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 text-white text-xs font-bold uppercase tracking-widest shadow-md border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Limited Flash Sale</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-slate-950 tracking-tight">
            Deal Of The <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">Day</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-md font-medium">
            সীমিত সময়ের বিশেষ অফার! কাউন্টডাউন শেষ হওয়ার আগেই লুফে নিন আকর্ষণীয় মূল্যে।
          </p>
        </div>

        {/* 1 Offer Layout: Full Width Premium Showcase */}
        {offers.length === 1 && (() => {
          const offer = offers[0];
          const timer = timeRemaining[offer._id || 'offer_0'] || { hours: 24, minutes: 0, seconds: 0 };
          const savings = offer.originalPrice > offer.offerPrice ? offer.originalPrice - offer.offerPrice : 0;
          const imgSrc = offer.productImage || offer.posterImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';

          return (
            <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900 text-white p-6 sm:p-10 lg:p-14 border border-amber-500/20 shadow-2xl ring-1 ring-white/10 group">
              {/* Internal ambient radial glow */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -top-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                
                {/* Left Column: Details & Pricing */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Badge & Live Status */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                      <span>{offer.badgeText || '⚡ LIMITED FLASH DEAL'}</span>
                    </span>

                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>In Stock & Ready to Ship</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight leading-tight">
                      {offer.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300/90 max-w-xl leading-relaxed">
                      {offer.subtitle || 'আমাদের প্রিমিয়াম কোয়ালিটি কালেকশনে আকর্ষণীয় ডিসকাউন্ট। অফার শেষ হওয়ার আগেই অর্ডার কনফার্ম করুন।'}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-baseline gap-3.5 pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight">
                        ৳{offer.offerPrice.toLocaleString()}
                      </span>
                    </div>

                    {offer.originalPrice > offer.offerPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                          ৳{offer.originalPrice.toLocaleString()}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase shadow-md">
                          {offer.discountPercentage}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Countdown Timer Units */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-amber-400" />
                      <span>অফারের বাকি সময়:</span>
                    </span>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                        <span className="text-xl sm:text-2xl font-black text-white font-display">
                          {String(timer.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hours</span>
                      </div>

                      <span className="text-xl font-black text-slate-500">:</span>

                      <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                        <span className="text-xl sm:text-2xl font-black text-white font-display">
                          {String(timer.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mins</span>
                      </div>

                      <span className="text-xl font-black text-slate-500">:</span>

                      <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-400/30 shadow-inner backdrop-blur-md">
                        <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">
                          {String(timer.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-300 tracking-wider">Secs</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean CTA Buttons (No Promo Code) */}
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <button
                      onClick={() => handleAddToCart(offer)}
                      className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transform transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-950" />
                      <span>Grab Flash Deal Now</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>

                    <Link
                      href={`/product/${offer.productSlug || offer.productId}`}
                      className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>View Product Details</span>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Product Showcase Container */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <Link
                    href={`/product/${offer.productSlug || offer.productId}`}
                    className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/15 p-4 sm:p-6 shadow-2xl backdrop-blur-md group/img block"
                  >
                    <img
                      src={imgSrc}
                      alt={offer.productName}
                      className="w-full h-full object-contain rounded-2xl group-hover/img:scale-105 transition-transform duration-500"
                    />

                    {savings > 0 && (
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                        SAVE ৳{savings.toLocaleString()}
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2 Offers Layout: Dual Column Grid */}
        {offers.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {offers.map((offer, index) => {
              const timer = timeRemaining[offer._id || `offer_${index}`] || { hours: 24, minutes: 0, seconds: 0 };
              const savings = offer.originalPrice > offer.offerPrice ? offer.originalPrice - offer.offerPrice : 0;
              const imgSrc = offer.productImage || offer.posterImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';

              return (
                <div
                  key={offer._id || index}
                  className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900 text-white p-6 sm:p-8 border border-amber-500/20 shadow-2xl ring-1 ring-white/10 flex flex-col justify-between group"
                >
                  <div className="space-y-5">
                    {/* Top Status & Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                        <span>{offer.badgeText || 'FLASH DEAL'}</span>
                      </span>

                      {savings > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                          SAVE ৳{savings.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Image & Title row */}
                    <div className="flex gap-4 sm:gap-5 items-center">
                      <Link
                        href={`/product/${offer.productSlug || offer.productId}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 p-2 shrink-0 overflow-hidden block group-hover:border-amber-400/40 transition-colors"
                      >
                        <img
                          src={imgSrc}
                          alt={offer.productName}
                          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="space-y-1.5 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-white font-display line-clamp-1">
                          {offer.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {offer.subtitle || offer.productName}
                        </p>

                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-xl sm:text-2xl font-black text-white font-display">
                            ৳{offer.offerPrice.toLocaleString()}
                          </span>
                          {offer.originalPrice > offer.offerPrice && (
                            <>
                              <span className="text-xs text-slate-400 line-through">
                                ৳{offer.originalPrice.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                {offer.discountPercentage}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>সময় বাকি:</span>
                      </span>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-white">
                          {String(timer.hours).padStart(2, '0')}h
                        </span>
                        <span className="text-slate-500">:</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-white">
                          {String(timer.minutes).padStart(2, '0')}m
                        </span>
                        <span className="text-slate-500">:</span>
                        <span className="px-2 py-1 bg-amber-400/20 text-amber-300 rounded-lg">
                          {String(timer.seconds).padStart(2, '0')}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean CTA Button (No Promo Code) */}
                  <div className="pt-5 border-t border-white/10 flex gap-2.5">
                    <button
                      onClick={() => handleAddToCart(offer)}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Grab Flash Deal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/product/${offer.productSlug || offer.productId}`}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-xs flex items-center justify-center transition-colors"
                    >
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
