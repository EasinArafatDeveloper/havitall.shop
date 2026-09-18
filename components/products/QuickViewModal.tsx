'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatImageUrl } from '@/lib/mediaUtils';

interface QuickViewModalProps {
  product: any | null;
  isOpen?: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen = true, onClose }: QuickViewModalProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id || product.id || product.slug);
  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'];
  const images = rawImages.map((img: string) => formatImageUrl(img));
  const colors = product.variants?.colors || [];
  const sizes = product.variants?.sizes || [];

  const handleAddToCart = () => {
    addToCart(
      product,
      quantity,
      selectedColor || colors[0],
      selectedSize || sizes[0]
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
            {/* Left: Images */}
            <div className="flex flex-col gap-3">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 relative flex items-center justify-center p-4">
                <img
                  src={images[selectedImageIdx] || images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    -{product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-slate-50 p-1 ${
                        selectedImageIdx === idx
                          ? 'border-slate-950 scale-105 shadow-sm'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Controls */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-500">
                    {product.category?.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{product.rating || 4.8}</span>
                    <span className="text-slate-400">({product.numReviews || 12} reviews)</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-950">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-slate-950 font-display">
                    ৳{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ৳{product.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {product.shortDescription || product.description}
                </p>

                {/* Color Variants */}
                {colors.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-700">
                      Color: <strong className="text-slate-950">{selectedColor || colors[0]}</strong>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c: string) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            (selectedColor || colors[0]) === c
                              ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Variants */}
                {sizes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-700">
                      Size: <strong className="text-slate-950">{selectedSize || sizes[0]}</strong>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s: string) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            (selectedSize || sizes[0]) === s
                              ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-slate-600 hover:text-slate-950 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-bold text-slate-950 min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-slate-600 hover:text-slate-950 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product._id || product.id || product.slug)}
                    className={`p-3 rounded-xl border transition-colors ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug || product._id}`}
                  onClick={onClose}
                  className="block text-center text-xs text-slate-700 hover:text-slate-950 font-semibold pt-1 underline"
                >
                  View full specifications & customer reviews →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
