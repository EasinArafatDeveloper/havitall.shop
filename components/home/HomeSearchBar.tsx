'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Search, ShieldCheck, Zap, ArrowRight, Flame } from 'lucide-react';
import LiveSearchBar from '@/components/search/LiveSearchBar';

const POPULAR_TAGS = [
  { name: '🔥 K8 Earbuds', query: 'k8' },
  { name: '⌚ Smart Watches', query: 'watch' },
  { name: '👜 Luxury Bags', query: 'bag' },
  { name: '⚡ Power Banks', query: 'power' },
  { name: '🎧 Audio & Sound', query: 'earbuds' },
];

export default function HomeSearchBar() {
  return (
    <section className="relative bg-slate-50 pt-2 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Main Live Search Input Box */}
        <div className="relative z-30">
          <LiveSearchBar 
            variant="hero"
            placeholder="কাঙ্ক্ষিত প্রোডাক্টের নাম লিখুন (যেমন: Earbuds, Watch, Bag, Speaker)..."
          />
        </div>

        {/* Quick Trending Keyword Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span>জনপ্রিয় সার্চ:</span>
          </span>

          {POPULAR_TAGS.map((tag, idx) => (
            <Link
              key={idx}
              href={`/shop?search=${encodeURIComponent(tag.query)}`}
              className="px-3 py-1 rounded-full bg-white hover:bg-slate-950 text-slate-700 hover:text-white border border-slate-200/90 hover:border-slate-950 font-semibold shadow-2xs transition-all hover:scale-105 active:scale-95"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
