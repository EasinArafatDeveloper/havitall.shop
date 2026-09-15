'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function DealOfTheDay() {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('HAVITALL20');
    setCopied(true);
    success('Coupon code "HAVITALL20" copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 sm:py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-slate-900 p-8 sm:p-12 lg:p-16 bg-slate-950 text-white shadow-2xl">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Limited Flash Deal</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-tight">
                Upgrade Your Lifestyle with <span className="text-amber-400 font-serif italic">30% OFF</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-lg">
                Exclusive flash offer on our top-rated collections. Claim your premium discount before the countdown runs out.
              </p>

              {/* Countdown Timer Boxes */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 shadow-inner backdrop-blur-sm">
                  <span className="text-xl sm:text-2xl font-black text-white font-display">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Hours</span>
                </div>
                <span className="text-xl font-black text-slate-400">:</span>
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 shadow-inner backdrop-blur-sm">
                  <span className="text-xl sm:text-2xl font-black text-white font-display">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Mins</span>
                </div>
                <span className="text-xl font-black text-slate-400">:</span>
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 shadow-inner backdrop-blur-sm">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Secs</span>
                </div>
              </div>

              {/* Promo code button & CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop?isHot=true"
                  className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <span>Grab Flash Deal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleCopy}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>CODE: HAVITALL20</span>
                </button>
              </div>
            </div>

            {/* Right Image Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-white/10 border border-white/20 p-3 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
                  alt="Deal of the day"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute top-6 right-6 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                  Save ৳1,500
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
