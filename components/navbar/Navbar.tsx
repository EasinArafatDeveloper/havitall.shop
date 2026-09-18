'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Heart, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight,
  Flame,
  Tag,
  Gift,
  Truck,
  BellRing,
  Layers,
  Phone,
  Clock
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import LiveSearchBar from '@/components/search/LiveSearchBar';

export default function Navbar() {
  const pathname = usePathname();
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
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/shop' },
    { name: 'Hot Deals 🔥', href: '/shop?isHot=true' },
    { name: 'Track Order', href: '/track-order' },
  ];

  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'crimson':
        return {
          wrapper: 'bg-slate-950 text-rose-200 border-b border-rose-950/60',
          highlight: 'text-rose-400 font-bold underline decoration-rose-500/60',
          icon: 'text-rose-400',
        };
      case 'emerald':
        return {
          wrapper: 'bg-slate-950 text-emerald-200 border-b border-emerald-950/60',
          highlight: 'text-emerald-400 font-bold underline decoration-emerald-500/60',
          icon: 'text-emerald-400',
        };
      case 'indigo':
        return {
          wrapper: 'bg-slate-950 text-indigo-200 border-b border-indigo-950/60',
          highlight: 'text-indigo-400 font-bold underline decoration-indigo-500/60',
          icon: 'text-indigo-400',
        };
      case 'neon_gradient':
        return {
          wrapper: 'bg-slate-950 text-amber-200 border-b border-slate-800',
          highlight: 'text-white font-bold bg-white/10 px-2 py-0.5 rounded-md',
          icon: 'text-amber-400',
        };
      case 'black':
        return {
          wrapper: 'bg-black text-slate-300 border-b border-white/10',
          highlight: 'text-white font-bold',
          icon: 'text-slate-400',
        };
      case 'dark_gold':
      default:
        return {
          wrapper: 'bg-slate-950 text-slate-300 border-b border-slate-800/80',
          highlight: 'text-amber-400 font-bold',
          icon: 'text-amber-400',
        };
    }
  };

  const renderTopBarIcon = (iconName?: string) => {
    const cls = 'w-3.5 h-3.5 shrink-0';
    switch (iconName) {
      case 'flame':
        return <Flame className={`${cls} animate-pulse text-amber-400`} />;
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
        return <Sparkles className={`${cls} text-amber-400`} />;
    }
  };

  const themeStyle = getThemeClasses(topBarOffer?.topBarTheme);

  return (
    <>
      {/* 1. Refined Luxury Top Announcement Bar */}
      {!isTopBarDismissed && (topBarOffer?.isActive !== false) && (
        <div className={`relative text-[11px] sm:text-xs py-2 px-4 transition-all duration-300 ${themeStyle.wrapper}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-center gap-2 text-center">
              <span className={themeStyle.icon}>
                {renderTopBarIcon(topBarOffer?.topBarIcon)}
              </span>
              
              {topBarOffer?.topBarLink ? (
                <Link 
                  href={topBarOffer.topBarLink}
                  className="hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity group"
                >
                  <span className="truncate">
                    {topBarOffer.topBarText || 'Exclusive Offer:'}{' '}
                    <span className={themeStyle.highlight}>
                      {topBarOffer.topBarHighlight || 'Use code HAVITALL20 for 20% OFF'}
                    </span>{' '}
                    {topBarOffer.topBarSuffix || '| Free Delivery over ৳1,500'}
                  </span>
                  <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ) : (
                <span className="truncate">
                  {topBarOffer?.topBarText || 'Exclusive Offer:'}{' '}
                  <span className={themeStyle.highlight}>
                    {topBarOffer?.topBarHighlight || 'Use code HAVITALL20 for 20% OFF'}
                  </span>{' '}
                  {topBarOffer?.topBarSuffix || '| Free Delivery over ৳1,500'}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsTopBarDismissed(true)}
              aria-label="Dismiss announcement"
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Luxury Clean Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs py-3'
            : 'bg-white border-b border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Left: Brand Identity Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-900 group-hover:scale-105 transition-all duration-200">
                <span className="font-extrabold text-lg tracking-wider font-display text-white">
                  H
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black tracking-tight font-display text-slate-950 group-hover:text-slate-700 transition-colors">
                    HAVITALL
                  </span>
                </div>
                <span className="text-[8px] tracking-[0.24em] uppercase font-bold text-slate-400 -mt-0.5">
                  LUXURY & LIFESTYLE
                </span>
              </div>
            </Link>

            {/* Middle Left: Clean Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Middle Right: Modern Search Bar */}
            <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm">
              <LiveSearchBar 
                variant="navbar" 
                placeholder="Search luxury products, earbuds, watches..." 
              />
            </div>

            {/* Right: Actions (Wishlist + Luxury Cart + Mobile Toggle) */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Wishlist Icon Button */}
              <Link
                href="/shop"
                title="Wishlist"
                aria-label="Wishlist"
                className="relative p-2 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Luxury Cart Pill Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Shopping Cart"
                className="relative flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 group border border-slate-800 cursor-pointer"
              >
                <div className="relative flex items-center">
                  <ShoppingBag className="w-4 h-4 text-slate-200 group-hover:text-white transition-colors" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                
                <div className="h-3 w-px bg-slate-700 hidden sm:block" />
                
                <span className="text-xs font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  ৳{subtotal.toLocaleString()}
                </span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors lg:hidden"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer / Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 mt-3 space-y-4 shadow-xl overflow-hidden"
            >
              {/* Mobile Live Search Bar */}
              <div className="w-full">
                <LiveSearchBar 
                  variant="mobile" 
                  placeholder="Search products, watches, earbuds..."
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>

              {/* Navigation Links List */}
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-slate-950 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Contact & Store Info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-950" />
                  <span className="font-semibold text-slate-900">01356-593305</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Nationwide Delivery</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

