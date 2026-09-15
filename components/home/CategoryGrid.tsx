'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Watch, 
  Headphones, 
  Briefcase, 
  Smartphone, 
  Glasses, 
  Footprints, 
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  Watch: Watch,
  Headphones: Headphones,
  Briefcase: Briefcase,
  Smartphone: Smartphone,
  Glasses: Glasses,
  Footprints: Footprints,
};

export default function CategoryGrid({ categories }: { categories: any[] }) {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse By Department</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-950 tracking-tight">
              Featured <span className="text-slate-600 font-serif italic font-normal">Collections</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-slate-600 flex items-center gap-1 group self-start sm:self-auto"
          >
            View all categories
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon || 'Watch'] || Layers;
            return (
              <motion.div
                key={cat._id || cat.slug || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group relative flex flex-col rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 p-4 transition-all duration-300 hover:shadow-md overflow-hidden"
                >
                  {/* Category Image */}
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-white relative mb-3 border border-slate-100">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                      alt={cat.name}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-white/95 text-slate-900 border border-slate-200 backdrop-blur-md shadow-sm">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cat.itemCount ? `${cat.itemCount} items` : 'Explore Now'}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
