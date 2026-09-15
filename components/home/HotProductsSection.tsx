'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Flame, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import QuickViewModal from '@/components/products/QuickViewModal';

export default function HotProductsSection({ products }: { products: any[] }) {
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'featured' | 'new'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'hot') return product.isHot;
    if (activeTab === 'featured') return product.isFeatured;
    if (activeTab === 'new') return product.isNewArrival;
    return true;
  });

  return (
    <section className="py-12 sm:py-16 bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce" />
              <span>Handpicked Exclusives</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-tight">
              Trending <span className="text-gradient-brand">Hot Products</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              Explore our highest-rated luxury timepieces, acoustic headphones, and modern accessories.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('hot')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'hot'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Hot Deals
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id || product.slug}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <span>Explore All Products ({products.length})</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-rose-400" />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  );
}
