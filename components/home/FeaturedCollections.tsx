'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowUpRight, 
  Star, 
  ShoppingBag, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import QuickViewModal from '@/components/products/QuickViewModal';

interface FeaturedCollectionsProps {
  products: any[];
}

export default function FeaturedCollections({ products }: FeaturedCollectionsProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Filter ONLY products marked as featured
  const displayProducts = (products || []).filter((p) => Boolean(p.isFeatured));

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Admin Selected Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-950 tracking-tight">
              Featured <span className="text-slate-600 font-serif italic font-normal">Collections</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
              Handpicked exclusive items chosen directly by our curation team.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              {displayProducts.length} Featured Items
            </span>
            <Link
              href="/shop?isFeatured=true"
              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-slate-600 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Display Products Grid */}
        {displayProducts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-slate-950">No Featured Products Selected Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Go to the Admin Panel &gt; Products and click the ⭐ Star on any product to showcase it in this section!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product._id || product.slug || product.businessKoroId}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
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
