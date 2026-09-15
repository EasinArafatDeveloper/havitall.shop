'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ArrowRight, Sparkles, Copy, Check, Flame, ShoppingBag } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCart } from '@/context/CartContext';

interface OfferItem {
  _id?: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  title: string;
  subtitle?: string;
  badgeText: string;
  couponCode: string;
  endDate: string;
  isActive: boolean;
}

interface DealOfTheDayProps {
  initialOffers?: OfferItem[];
}

export default function DealOfTheDay({ initialOffers }: DealOfTheDayProps) {
  const { success } = useToast();
  const { addToCart } = useCart();
  const [offers, setOffers] = useState<OfferItem[]>(initialOffers || []);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Timers for offer 0 and offer 1
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: { hours: number; minutes: number; seconds: number } }>({});

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/offers?activeOnly=true');
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

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddToCart = (offer: OfferItem) => {
    const prod = {
      _id: offer.productId,
      name: offer.productName,
      slug: offer.productSlug,
      price: offer.offerPrice,
      originalPrice: offer.originalPrice,
      images: [offer.productImage],
      stock: 15,
      isOffer: true,
      offerBadge: offer.badgeText || '🔥 Flash Deal',
    };
    addToCart(prod, 1, undefined, undefined, true, offer.badgeText || '🔥 Flash Deal');
  };

  if (!offers || offers.length === 0) {
    return null;
  }

  // If 1 Active Offer: Full-width Hero Offer Card
  if (offers.length === 1) {
    const offer = offers[0];
    const timer = timeRemaining[offer._id || 'offer_0'] || { hours: 24, minutes: 0, seconds: 0 };
    const savings = offer.originalPrice > offer.offerPrice ? offer.originalPrice - offer.offerPrice : 0;

    return (
      <section className="py-12 sm:py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-slate-900 p-8 sm:p-12 lg:p-16 bg-slate-950 text-white shadow-2xl">
            {/* Subtle Glow Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Info */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{offer.badgeText || 'LIMITED FLASH DEAL'}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-tight">
                  {offer.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 max-w-lg">
                  {offer.subtitle || `Exclusive flash discount on ${offer.productName}. Claim your premium deal before countdown runs out.`}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-display">
                    ৳{offer.offerPrice.toLocaleString()}
                  </span>
                  {offer.originalPrice > offer.offerPrice && (
                    <>
                      <span className="text-lg text-slate-400 line-through">
                        ৳{offer.originalPrice.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black uppercase">
                        {offer.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Countdown Timer Boxes */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 shadow-inner backdrop-blur-sm">
                    <span className="text-xl sm:text-2xl font-black text-white font-display">
                      {String(timer.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Hours</span>
                  </div>
                  <span className="text-xl font-black text-slate-400">:</span>
                  <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 shadow-inner backdrop-blur-sm">
                    <span className="text-xl sm:text-2xl font-black text-white font-display">
                      {String(timer.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Mins</span>
                  </div>
                  <span className="text-xl font-black text-slate-400">:</span>
                  <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 shadow-inner backdrop-blur-sm">
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">
                      {String(timer.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Secs</span>
                  </div>
                </div>

                {/* Promo Code & Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <button
                    onClick={() => handleAddToCart(offer)}
                    className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Grab Flash Deal</span>
                  </button>

                  {offer.couponCode && (
                    <button
                      onClick={() => handleCopy(offer.couponCode)}
                      className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedCode === offer.couponCode ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>CODE: {offer.couponCode}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Image Showcase */}
              <div className="lg:col-span-5 relative flex justify-center">
                <Link
                  href={`/product/${offer.productSlug || offer.productId}`}
                  className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-white/10 border border-white/20 p-4 shadow-2xl group block"
                >
                  <img
                    src={offer.productImage}
                    alt={offer.productName}
                    className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  {savings > 0 && (
                    <div className="absolute top-6 right-6 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                      Save ৳{savings.toLocaleString()}
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If 2 Active Offers: Dual Column Grid
  return (
    <section className="py-12 sm:py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Exclusive Flash Offers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-950">
            Limited Time <span className="text-slate-500 font-serif italic font-normal">Flash Deals</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Grab premium lifestyle discounts before the active countdown timers run out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {offers.map((offer, index) => {
            const timer = timeRemaining[offer._id || `offer_${index}`] || { hours: 24, minutes: 0, seconds: 0 };
            const savings = offer.originalPrice > offer.offerPrice ? offer.originalPrice - offer.offerPrice : 0;

            return (
              <div
                key={offer._id || index}
                className="relative rounded-3xl overflow-hidden border border-slate-900 p-6 sm:p-8 bg-slate-950 text-white shadow-2xl flex flex-col justify-between"
              >
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  {/* Top Badge & Code */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{offer.badgeText || 'FLASH DEAL'}</span>
                    </span>

                    {offer.couponCode && (
                      <button
                        onClick={() => handleCopy(offer.couponCode)}
                        className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCode === offer.couponCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{offer.couponCode}</span>
                      </button>
                    )}
                  </div>

                  {/* Image & Title Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-7 space-y-3">
                      <h3 className="text-xl sm:text-2xl font-black font-display text-white line-clamp-2">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {offer.subtitle || `Special limited offer on ${offer.productName}`}
                      </p>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2.5 pt-1">
                        <span className="text-2xl font-black text-white font-display">
                          ৳{offer.offerPrice.toLocaleString()}
                        </span>
                        {offer.originalPrice > offer.offerPrice && (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              ৳{offer.originalPrice.toLocaleString()}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                              {offer.discountPercentage}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-5 relative flex justify-center">
                      <Link
                        href={`/product/${offer.productSlug || offer.productId}`}
                        className="relative w-full aspect-square max-w-[160px] rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-2 shadow-lg group block"
                      >
                        <img
                          src={offer.productImage}
                          alt={offer.productName}
                          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                        {savings > 0 && (
                          <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md uppercase">
                            -৳{savings.toLocaleString()}
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>

                  {/* Countdown Timer Row */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/15">
                        <span className="text-sm font-black text-white font-display">
                          {String(timer.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] uppercase font-bold text-slate-400">Hrs</span>
                      </div>
                      <span className="font-bold text-slate-400">:</span>
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/15">
                        <span className="text-sm font-black text-white font-display">
                          {String(timer.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] uppercase font-bold text-slate-400">Min</span>
                      </div>
                      <span className="font-bold text-slate-400">:</span>
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/15">
                        <span className="text-sm font-black text-amber-400 font-display">
                          {String(timer.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] uppercase font-bold text-slate-400">Sec</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(offer)}
                      className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transform transition-transform active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Grab Deal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
