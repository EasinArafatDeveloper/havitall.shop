'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  X, 
  Sparkles, 
  Flame, 
  RotateCcw 
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import QuickViewModal from '@/components/products/QuickViewModal';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialHot = searchParams.get('isHot') === 'true';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [onlyHot, setOnlyHot] = useState<boolean>(initialHot);
  const [maxPrice, setMaxPrice] = useState<number>(12000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/categories'),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products || []);
        if (catData.success) setCategories(catData.categories || []);
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update category when query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const s = searchParams.get('search');
    if (s) setSearchTerm(s);
  }, [searchParams]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Hot filter
    if (onlyHot) {
      list = list.filter((p) => p.isHot);
    }

    // Price filter
    list = list.filter((p) => (p.price || 0) <= maxPrice);

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return list;
  }, [products, selectedCategory, onlyHot, maxPrice, searchTerm, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setOnlyHot(false);
    setMaxPrice(12000);
    setSortBy('newest');
  };

  return (
    <div className="bg-dark-200 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-white font-semibold">Shop Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-rose-400 font-semibold capitalize">{selectedCategory.replace('-', ' ')}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-white">
            {selectedCategory !== 'all' ? (
              <span className="capitalize">{selectedCategory.replace('-', ' ')} Collection</span>
            ) : (
              <span>All Luxury <span className="text-gradient-brand">Products</span></span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Showing {filteredProducts.length} items matching your curated criteria
          </p>
        </div>

        {/* Toolbar: Search, Filter Toggle, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-100 border border-slate-800 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              placeholder="Search products, keywords, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
            >
              <Filter className="w-4 h-4 text-rose-400" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 p-6 rounded-2xl bg-dark-100 border border-slate-800 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-rose-400" /> Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-500">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.slug).length;
                  return (
                    <button
                      key={cat._id || cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-500">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-300">
                  Max Price
                </h4>
                <span className="font-black text-rose-400 font-display">৳{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="12000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>৳500</span>
                <span>৳12,000</span>
              </div>
            </div>

            {/* Hot Deals Toggle */}
            <div className="pt-4 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyHot}
                  onChange={(e) => setOnlyHot(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 accent-rose-500"
                />
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Hot & Trending Only
                </span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 rounded-2xl bg-slate-800/50 border border-slate-700/50" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-dark-100 border border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No products found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any products matching your active filters. Try adjusting your search or price range.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.slug}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark-200">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
