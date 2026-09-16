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
  ArrowRight,
  Flame,
  Tag,
  Gift,
  BellRing
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import LiveSearchBar from '@/components/search/LiveSearchBar';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount, setIsCartOpen, subtotal, wishlist } = useCart();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Top Bar Offer State
  const [topBarOffer, setTopBarOffer] = useState<{
    _id?: string;
    title?: string;
    topBarText?: string;
    topBarHighlight?: string;
    topBarSuffix?: string;
    topBarLink?: string;
    topBarTheme?: string;
    topBarIcon?: string;
    isActive?: boolean;
  } | null>(null);
  const [isTopBarDismissed, setIsTopBarDismissed] = useState(false);

  useEffect(() => {
    async function loadTopBar() {
      try {
        const res = await fetch('/api/offers?topBarOnly=true');
        const data = await res.json();
        if (data.success && data.offers && data.offers.length > 0) {
          const active = data.offers.find((o: any) => o.isActive !== false);
          if (active) {
            setTopBarOffer(active);
          }
        }
      } catch (err) {
        console.error('Failed to load top bar offer:', err);
      }
    }
    loadTopBar();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Collection', href: '/shop' },
    { name: 'Hot Deals 🔥', href: '/shop?isHot=true' },
    { name: 'Track Order', href: '/track-order' },
  ];

  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'crimson':
        return {
          wrapper: 'bg-rose-950 text-rose-100 border-b border-rose-800/80',
          highlight: 'text-rose-300 underline decoration-rose-400 font-bold',
          icon: 'text-rose-400',
        };
      case 'emerald':
        return {
          wrapper: 'bg-emerald-950 text-emerald-100 border-b border-emerald-800/80',
          highlight: 'text-emerald-300 underline decoration-emerald-400 font-bold',
          icon: 'text-emerald-400',
        };
      case 'indigo':
        return {
          wrapper: 'bg-indigo-950 text-indigo-100 border-b border-indigo-800/80',
          highlight: 'text-indigo-300 underline decoration-indigo-400 font-bold',
          icon: 'text-indigo-400',
        };
      case 'neon_gradient':
        return {
          wrapper: 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 text-white shadow-xs',
          highlight: 'bg-white/20 px-2 py-0.5 rounded text-white font-bold',
          icon: 'text-amber-200',
        };
      case 'black':
        return {
          wrapper: 'bg-zinc-950 text-zinc-200 border-b border-zinc-800',
          highlight: 'text-white underline decoration-zinc-400 font-bold',
          icon: 'text-zinc-400',
        };
      case 'dark_gold':
      default:
        return {
          wrapper: 'bg-slate-900 text-slate-200 border-b border-slate-800',
          highlight: 'text-amber-400 underline decoration-amber-400 font-bold',
          icon: 'text-amber-400',
        };
    }
  };

  const renderTopBarIcon = (iconName?: string) => {
    const cls = 'w-3.5 h-3.5 shrink-0';
    switch (iconName) {
      case 'flame':
        return <Flame className={`${cls} animate-pulse`} />;
      case 'tag':
        return <Tag className={cls} />;
      case 'truck':
        return <Truck className={cls} />;
      case 'gift':
        return <Gift className={cls} />;
      case 'bell':
        return <BellRing className={`${cls} animate-bounce`} />;
      case 'sparkles':
      default:
        return <Sparkles className={`${cls} animate-spin-slow`} />;
    }
  };

  const themeStyle = getThemeClasses(topBarOffer?.topBarTheme);

  return (
    <>
      {/* Top Announcement Bar */}
      {!isTopBarDismissed && (topBarOffer?.isActive !== false) && (
        <div className={`relative text-xs py-2 px-4 transition-all duration-300 ${themeStyle.wrapper}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-medium text-center">
            <span className={themeStyle.icon}>
              {renderTopBarIcon(topBarOffer?.topBarIcon)}
            </span>
            
            {topBarOffer?.topBarLink ? (
              <Link 
                href={topBarOffer.topBarLink}
                className="hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity group"
              >
                <span>
                  {topBarOffer.topBarText || 'Grand Launch: Use code'}{' '}
                  <span className={themeStyle.highlight}>
                    {topBarOffer.topBarHighlight || 'HAVITALL20 for 20% OFF'}
                  </span>{' '}
                  {topBarOffer.topBarSuffix || '| Free Shipping over ৳1,500'}
                </span>
                <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <span>
                {topBarOffer?.topBarText || 'Grand Launch: Use code'}{' '}
                <span className={themeStyle.highlight}>
                  {topBarOffer?.topBarHighlight || 'HAVITALL20 for 20% OFF'}
                </span>{' '}
                {topBarOffer?.topBarSuffix || '| Free Shipping over ৳1,500'}
              </span>
            )}
          </div>
        </div>
      )}

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

          {/* Search Bar with Live Suggestions Dropdown */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-md">
            <LiveSearchBar variant="navbar" placeholder="Search luxury products, earbuds, watches..." />
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
              {/* Mobile Live Search Bar */}
              <div className="w-full">
                <LiveSearchBar 
                  variant="mobile" 
                  placeholder="Search products..."
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>

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
