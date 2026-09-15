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
    <section className="py-12 sm:py-16 bg-dark-100 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse By Department</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-tight">
              Featured <span className="text-gradient-gold">Collections</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 group self-start sm:self-auto"
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
                  className="group relative flex flex-col rounded-2xl bg-dark-200 border border-slate-800/80 hover:border-amber-500/40 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden"
                >
                  {/* Category Image */}
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 relative mb-3">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                      alt={cat.name}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-200/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-dark-100/90 text-amber-400 border border-slate-700/80 backdrop-blur-md">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
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
