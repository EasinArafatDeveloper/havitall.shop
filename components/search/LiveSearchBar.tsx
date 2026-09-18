'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Tag, 
  Flame, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  category?: string;
  isHot?: boolean;
  isFeatured?: boolean;
  stock?: number;
}

interface LiveSearchBarProps {
  placeholder?: string;
  variant?: 'navbar' | 'hero' | 'mobile';
  className?: string;
  onNavigate?: () => void;
}

const TRENDING_KEYWORDS = [
  { label: 'Wireless Earbuds', query: 'earbuds', icon: '🔥' },
  { label: 'Smart Watch', query: 'watch', icon: '⌚' },
  { label: 'Luxury Bags', query: 'bag', icon: '👜' },
  { label: 'Power Bank', query: 'power', icon: '⚡' },
  { label: 'Bluetooth Speaker', query: 'speaker', icon: '🔊' },
];

export default function LiveSearchBar({
  placeholder = 'Search luxury products, gadgets, audio...',
  variant = 'navbar',
  className = '',
  onNavigate,
}: LiveSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductItem[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('havitall_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('havitall_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('havitall_recent_searches');
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results with fast debounce (180ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setMatchingCategories([]);
      setTotalCount(0);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=6`);
        const data = await res.json();
        if (data.success) {
          setResults(data.products || []);
          setMatchingCategories(data.matchingCategories || []);
          setTotalCount(data.count || (data.products?.length || 0));
        } else {
          setResults([]);
          setMatchingCategories([]);
        }
      } catch (err) {
        console.error('Live search fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    saveRecentSearch(term);
    setIsOpen(false);
    if (onNavigate) onNavigate();
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      const selected = results[selectedIndex];
      goToProduct(selected);
      return;
    }
    executeSearch(query);
  };

  const goToProduct = (product: ProductItem) => {
    saveRecentSearch(query || product.name);
    setIsOpen(false);
    if (onNavigate) onNavigate();
    const slug = product.slug || product._id || product.id;
    router.push(`/product/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Helper to highlight matching characters in text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={i} className="text-rose-600 font-black bg-rose-50 px-0.5 rounded underline decoration-rose-400">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`relative flex items-center transition-all duration-200 ${
            isHero
              ? 'bg-white/95 backdrop-blur-md rounded-2xl border-2 border-slate-900/10 hover:border-slate-900/30 focus-within:border-slate-950 focus-within:ring-4 focus-within:ring-slate-950/10 shadow-lg'
              : 'bg-slate-50/90 hover:bg-slate-100/90 focus-within:bg-white rounded-full border border-slate-200/80 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 shadow-2xs'
          }`}
        >
          {/* Magnifier Icon / Loading Spinner */}
          <div className="pl-4 pr-2 flex items-center justify-center shrink-0">
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-rose-600 animate-spin" />
            ) : (
              <Search
                className={`${
                  isHero ? 'w-5 h-5 text-slate-700' : 'w-4 h-4 text-slate-400'
                } transition-colors`}
              />
            )}
          </div>

          {/* Actual Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className={`w-full bg-transparent text-slate-950 placeholder:text-slate-400 focus:outline-none font-medium ${
              isHero ? 'py-3.5 sm:py-4 text-sm sm:text-base pr-12' : 'py-2 sm:py-2.5 text-xs sm:text-sm pr-9'
            }`}
          />

          {/* Clear Button (X) */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Hero Search Submit Button */}
          {isHero && (
            <button
              type="submit"
              className="hidden sm:flex items-center gap-1.5 mr-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestion Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col ${
              isHero ? 'max-w-2xl mx-auto' : ''
            }`}
            style={{ maxHeight: '80vh' }}
          >
            <div className="overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3 space-y-2">
              
              {/* 1. When typing: Show matching categories */}
              {query.trim() && matchingCategories.length > 0 && (
                <div className="px-2 py-1.5 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Matching Categories (ক্যাটাগরি)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        href={`/shop?category=${encodeURIComponent(cat)}`}
                        onClick={() => {
                          setIsOpen(false);
                          if (onNavigate) onNavigate();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-950 text-slate-800 hover:text-white text-xs font-semibold transition-all group cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-400" />
                        <span>In {cat}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. When typing: Show Matched Products List */}
              {query.trim() && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Products ({results.length > 0 ? `${results.length} results` : 'Searching...'})
                    </span>
                    {totalCount > results.length && (
                      <span className="text-[10px] text-amber-700 font-bold">
                        +{totalCount - results.length} more available
                      </span>
                    )}
                  </div>

                  {isLoading && results.length === 0 ? (
                    // Loading skeleton
                    <div className="space-y-2 p-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 animate-pulse">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-1">
                      {results.map((product, idx) => {
                        const isSelected = selectedIndex === idx;
                        const origPrice = Number(product.originalPrice || 0);
                        const currentPrice = Number(product.price || 0);
                        const discount = origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0;
                        const img = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200';

                        return (
                          <div
                            key={product._id || product.slug || idx}
                            onClick={() => goToProduct(product)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'hover:bg-slate-100/80 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={img}
                                alt={product.name}
                                className={`w-12 h-12 object-contain rounded-xl p-1 shrink-0 border ${
                                  isSelected ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                                }`}
                              />
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {product.category && (
                                    <span
                                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                        isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {product.category}
                                    </span>
                                  )}
                                  {product.isHot && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-500 flex items-center gap-0.5">
                                      <Flame className="w-2.5 h-2.5" /> HOT
                                    </span>
                                  )}
                                </div>

                                <p
                                  className={`text-xs font-bold truncate ${
                                    isSelected ? 'text-white' : 'text-slate-900'
                                  }`}
                                >
                                  {highlightMatch(product.name, query)}
                                </p>

                                <div className="flex items-baseline gap-1.5">
                                  <span
                                    className={`text-xs font-black ${
                                      isSelected ? 'text-amber-400' : 'text-slate-950'
                                    }`}
                                  >
                                    ৳{currentPrice.toLocaleString()}
                                  </span>
                                  {origPrice > currentPrice && (
                                    <>
                                      <span
                                        className={`text-[10px] line-through ${
                                          isSelected ? 'text-slate-400' : 'text-slate-400'
                                        }`}
                                      >
                                        ৳{origPrice.toLocaleString()}
                                      </span>
                                      <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                                        {discount}% OFF
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1 text-xs font-semibold opacity-70">
                              <span className="hidden sm:inline text-[11px]">View</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Empty state
                    <div className="p-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        "{query}" দিয়ে কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি
                      </p>
                      <p className="text-[11px] text-slate-500">
                        বানান চেক করুন অথবা নিচের পপুলার সার্চগুলো দেখুন
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Empty Input state: Show Recent Searches & Trending */}
              {!query.trim() && (
                <div className="space-y-4 p-2">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Recent Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setQuery(term);
                              executeSearch(term);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Popular Keywords */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-500" />
                      Trending Searches (জনপ্রিয় সার্চ)
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {TRENDING_KEYWORDS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuery(item.query);
                            executeSearch(item.query);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 hover:bg-slate-950 text-slate-900 hover:text-white border border-amber-200/80 hover:border-slate-950 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer "View all results" button */}
            {query.trim() && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>"{query}" সম্পর্কিত সব ফলাফল দেখুন ({totalCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
