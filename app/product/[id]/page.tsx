'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Share2
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/products/ProductCard';
import { trackViewContent } from '@/lib/fbpixel';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { success } = useToast();

  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          trackViewContent({
            id: data.product._id || data.product.slug,
            name: data.product.name,
            price: Number(data.product.offerPrice || data.product.price),
          });
          if (data.product.variants?.colors?.[0]) {
            setSelectedColor(data.product.variants.colors[0]);
          }
          if (data.product.variants?.sizes?.[0]) {
            setSelectedSize(data.product.variants.sizes[0]);
          }

          // Fetch related products in the same category
          const relRes = await fetch(`/api/products?category=${data.product.category}&limit=4`);
          const relData = await relRes.json();
          if (relData.success) {
            setRelatedProducts(
              (relData.products || []).filter((p: any) => p._id !== data.product._id && p.slug !== data.product.slug)
            );
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading exquisite product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-xl font-bold text-slate-950 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-600 max-w-sm mb-4">
          The requested product may have been moved or is currently out of stock.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id || product.id || product.slug);
  const images = product.images && product.images.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'];
  const colors = product.variants?.colors || [];
  const sizes = product.variants?.sizes || [];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Product link copied to clipboard!');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-slate-900 capitalize transition-colors">
            {product.category?.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* Left: Product Images Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main High-res Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white p-4 border border-slate-200 shadow-sm flex items-center justify-center">
              <img
                src={images[selectedImgIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-contain rounded-2xl"
              />
              {product.discountPercentage > 0 && (
                <span className="absolute top-6 left-6 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-sm uppercase tracking-wider">
                  -{product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all bg-white p-1 ${
                      selectedImgIdx === idx
                        ? 'border-slate-950 scale-105 shadow-md'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Purchase Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                  {product.category?.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{product.rating || 4.8}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    ({product.numReviews || 12} customer reviews)
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
                  ৳{product.price?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base sm:text-lg text-slate-400 line-through">
                    ৳{product.originalPrice?.toLocaleString()}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Color Variants */}
              {colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Color: <strong className="text-slate-950">{selectedColor || colors[0]}</strong>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          (selectedColor || colors[0]) === c
                            ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
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
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Size: <strong className="text-slate-950">{selectedSize || sizes[0]}</strong>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          (selectedSize || sizes[0]) === s
                            ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  {/* Quantity */}
                  <div className="flex items-center justify-center border border-slate-200 bg-white rounded-xl shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-slate-600 hover:text-slate-950 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-bold text-slate-950 min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-slate-600 hover:text-slate-950 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Wishlist & Share (grouped next to quantity on mobile) */}
                  <div className="flex items-center gap-3 sm:hidden">
                    <button
                      onClick={() => toggleWishlist(product._id || product.id || product.slug)}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        inWishlist
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-950'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-950 transition-colors"
                      aria-label="Share product"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span>Add to Cart</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                {/* Wishlist & Share (inline on tablet/desktop) */}
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={() => toggleWishlist(product._id || product.id || product.slug)}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-950'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-950 transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <Truck className="w-4 h-4 text-slate-950 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900">Free Delivery</span>
                  <span className="text-[10px] text-slate-500">Over ৳1,500</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-slate-950 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900">100% Genuine</span>
                  <span className="text-[10px] text-slate-500">Certified Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <RefreshCw className="w-4 h-4 text-slate-950 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900">7-Day Return</span>
                  <span className="text-[10px] text-slate-500">Easy Replacement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info: Description, Specifications, Reviews */}
        <div className="mb-16 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 text-sm font-bold transition-colors relative ${
                activeTab === 'desc'
                  ? 'text-slate-950 border-b-2 border-slate-950 -mb-4'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Description & Highlights
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 text-sm font-bold transition-colors relative ${
                activeTab === 'specs'
                  ? 'text-slate-950 border-b-2 border-slate-950 -mb-4'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Key Features & Specs
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 text-sm font-bold transition-colors relative ${
                activeTab === 'reviews'
                  ? 'text-slate-950 border-b-2 border-slate-950 -mb-4'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Customer Reviews ({product.numReviews || 12})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'desc' && (
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              {product.features && product.features.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                  {product.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <Check className="w-4 h-4 text-slate-950 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Detailed specifications available upon request.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-3xl font-black text-slate-950 font-display">
                  {product.rating || 4.8}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Based on verified purchaser feedback</p>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="divide-y divide-slate-100 space-y-3 pt-2">
                <div className="pt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">Rahim Uddin (Verified Buyer)</span>
                    <span className="text-slate-400">3 days ago</span>
                  </div>
                  <div className="flex text-amber-500 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">
                    Exceeded my expectations! Packaging was super luxury, build quality is top tier. Fast delivery in Dhaka within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-display text-slate-950">
              You May Also Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
