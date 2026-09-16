'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  X, 
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
  const initialFeatured = searchParams.get('isFeatured') === 'true';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [onlyHot, setOnlyHot] = useState<boolean>(initialHot);
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(initialFeatured);
  const [maxPrice, setMaxPrice] = useState<number>(12000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Load products directly from MongoDB API
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

        if (prodData.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        }
        if (catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update category and params when query changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const s = searchParams.get('search');
    if (s) setSearchTerm(s);
    if (searchParams.get('isHot') === 'true') setOnlyHot(true);
    if (searchParams.get('isFeatured') === 'true') setOnlyFeatured(true);
  }, [searchParams]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Featured filter
    if (onlyFeatured) {
      list = list.filter((p) => Boolean(p.isFeatured));
    }

    // Hot filter
    if (onlyHot) {
      list = list.filter((p) => Boolean(p.isHot));
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
  }, [products, selectedCategory, onlyFeatured, onlyHot, maxPrice, searchTerm, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setOnlyHot(false);
    setOnlyFeatured(false);
    setMaxPrice(12000);
    setSortBy('newest');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-950 font-semibold">Shop Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-slate-950 font-semibold capitalize">{selectedCategory.replace('-', ' ')}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-950">
            {selectedCategory !== 'all' ? (
              <span className="capitalize">{selectedCategory.replace('-', ' ')} Collection</span>
            ) : (
              <span>All Products & <span className="text-slate-600 font-serif italic font-normal">Catalog</span></span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {filteredProducts.length} items matching your curated criteria
          </p>
        </div>

        {/* Toolbar: Search, Filter Toggle, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 mb-8 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              placeholder="Search products, keywords, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              <Filter className="w-4 h-4 text-slate-950" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950"
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
          <aside className="hidden lg:block space-y-6 p-6 rounded-2xl bg-white border border-slate-200 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-950" /> Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-slate-600 hover:text-slate-950 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] opacity-70">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.slug).length;
                  return (
                    <button
                      key={cat._id || cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-slate-950 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700">
                  Max Price
                </h4>
                <span className="font-black text-slate-950 font-display">৳{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="12000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-slate-950 bg-slate-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>৳500</span>
                <span>৳12,000</span>
              </div>
            </div>

            {/* Hot Deals Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyHot}
                  onChange={(e) => setOnlyHot(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 accent-slate-950"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-600" /> Hot & Trending Only
                </span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 shadow-sm" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your active filters. Try adjusting your search or price range.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all"
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

      {/* Mobile / Tablet Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="relative ml-auto h-full w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <span className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-950" /> Filters
              </span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Categories
                  </h4>
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-slate-600 hover:text-slate-950 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] opacity-70">{products.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat.slug).length;
                    return (
                      <button
                        key={cat._id || cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                          selectedCategory === cat.slug
                            ? 'bg-slate-950 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-700">
                    Max Price
                  </h4>
                  <span className="font-black text-slate-950 font-display">৳{maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="12000"
                  step="250"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-slate-950 bg-slate-200 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>৳500</span>
                  <span>৳12,000</span>
                </div>
              </div>

              {/* Hot Deals Toggle */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyHot}
                    onChange={(e) => setOnlyHot(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 accent-slate-950"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-600" /> Hot & Trending Only
                  </span>
                </label>
              </div>
            </div>

            {/* Sticky Apply Button */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition-all active:scale-95"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
