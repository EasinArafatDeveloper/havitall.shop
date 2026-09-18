'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Eye, 
  ShoppingBag, 
  Star, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { formatImageUrl } from '@/lib/mediaUtils';

interface ProductCardProps {
  product: any;
  onQuickView?: (product: any) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const inWishlist = isInWishlist(product._id || product.id || product.slug);
  const rawPrimary = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
  const rawSecondary = product.images?.[1] || rawPrimary;
  const primaryImage = formatImageUrl(rawPrimary);
  const secondaryImage = formatImageUrl(rawSecondary);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id || product.id || product.slug);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg bg-rose-600 text-white shadow-sm">
            -{product.discountPercentage}%
          </span>
        ) : null}
        {product.isHot && (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> HOT
          </span>
        )}
        {product.badge && !product.isHot && (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            {product.badge}
          </span>
        )}
      </div>

      {/* Action Buttons (Wishlist & Quick View) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md border shadow-sm transition-all duration-200 ${
            inWishlist
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
        {onQuickView && (
          <button
            onClick={handleQuickView}
            aria-label="Quick preview"
            className="w-9 h-9 rounded-xl bg-white/95 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 flex items-center justify-center backdrop-blur-md shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Image Link */}
      <Link
        href={`/product/${product.slug || product._id}`}
        className="relative block aspect-square w-full overflow-hidden bg-slate-50"
      >
        <img
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="capitalize font-semibold text-slate-500 tracking-wide text-[11px]">
              {product.category?.replace('-', ' ')}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating || 4.8}</span>
              <span className="text-slate-400 text-[10px] font-normal">
                ({product.numReviews || 12})
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/product/${product.slug || product._id}`}
            className="block text-sm sm:text-base font-bold text-slate-900 hover:text-slate-700 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-950 font-display">
                ৳{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ৳{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to Cart"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 group/btn"
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
