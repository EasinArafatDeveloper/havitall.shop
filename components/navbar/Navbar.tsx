'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Truck, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount, setIsCartOpen, subtotal, wishlist } = useCart();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Collection', href: '/shop' },
    { name: 'Hot Deals 🔥', href: '/shop?isHot=true' },
    { name: 'Track Order', href: '/track-order' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 text-center text-slate-200 flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
        <span>Grand Launch: Use code <strong className="text-white underline decoration-amber-400">HAVITALL20</strong> for 20% OFF | Free Shipping over ৳1,500</span>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm py-3'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-zinc-800 to-rose-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-xl font-display">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight font-display text-slate-950 group-hover:text-rose-600 transition-colors">
                HavIt<span className="text-gradient-brand">All</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500 -mt-1">
                Luxury & Lifestyle
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-slate-950 bg-slate-100 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar with Live Dropdown */}
          <div ref={searchRef} className="relative hidden md:block flex-1 max-w-xs lg:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search luxury products, gadgets, audio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Live Search Results Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 overflow-hidden"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1.5 border-b border-slate-100">
                    Search Results ({searchResults.length})
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link
                        key={item._id || item.slug}
                        href={`/product/${item.slug || item._id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors group"
                      >
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-rose-600 font-bold mt-0.5">
                            ৳{item.price?.toLocaleString()}
                            {item.originalPrice && (
                              <span className="text-slate-400 line-through ml-1.5 font-normal text-[11px]">
                                ৳{item.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center text-xs text-rose-600 hover:text-rose-700 font-semibold py-2 border-t border-slate-100 mt-1 flex items-center justify-center gap-1"
                  >
                    View all results <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Order Icon Button */}
            <Link
              href="/track-order"
              title="Track Order"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors"
            >
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Track</span>
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/shop"
              title="Wishlist"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors"
            >
              <Heart className="w-5 h-5 text-slate-700 hover:text-rose-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Shopping Cart"
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all duration-300 group active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">
                ৳{subtotal.toLocaleString()}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-950 bg-slate-100 border border-slate-200 lg:hidden"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 mt-3 space-y-4 shadow-lg"
            >
              {/* Mobile Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>

              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-sm font-semibold transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
