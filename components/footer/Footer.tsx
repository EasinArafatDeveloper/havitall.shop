'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Facebook
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function Footer() {
  const { success } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      success('Thank you for subscribing to HavItAll VIP newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xl font-display">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight font-display text-slate-950">
                  HavIt<span className="text-slate-600 font-serif italic font-normal">All</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 -mt-1">
                  Luxury & Lifestyle
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              HavItAll is your premier digital destination for verified quality essentials, watches, premium audio, and lifestyle gear.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-950 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Join VIP Inner Circle
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 flex-1 focus:outline-none focus:border-slate-950"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Join</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Follow Us
              </span>
              <a
                href="https://www.facebook.com/havitall"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HavItAll on Facebook"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-950 text-slate-700 hover:text-white border border-slate-200 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-slate-950 transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop?isHot=true" className="hover:text-slate-950 transition-colors">
                  Hot Deals 🔥
                </Link>
              </li>
              <li>
                <Link href="/shop?isFeatured=true" className="hover:text-slate-950 transition-colors">
                  Featured Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-slate-950 transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">
              Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=luxury-watches" className="hover:text-slate-950 transition-colors">
                  Luxury Watches
                </Link>
              </li>
              <li>
                <Link href="/shop?category=audio-acoustics" className="hover:text-slate-950 transition-colors">
                  Audio & Acoustics
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bags-leather" className="hover:text-slate-950 transition-colors">
                  Leather Goods & Bags
                </Link>
              </li>
              <li>
                <Link href="/shop?category=smart-gadgets" className="hover:text-slate-950 transition-colors">
                  Smart Tech & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=eyewear-shades" className="hover:text-slate-950 transition-colors">
                  Eyewear & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">
              Concierge Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>01356-593305</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>havitall.info@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-950 shrink-0 mt-0.5" />
                <span>Bashundhara, Dhaka 1229, Bangladesh</span>
              </li>
            </ul>

            {/* Payment Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Payment Partners
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">bKash</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Nagad</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Visa / Card</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HavItAll Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/shop" className="hover:text-slate-800">Terms of Service</Link>
            <span>•</span>
            <Link href="/shop" className="hover:text-slate-800">Privacy Policy</Link>
            <span>•</span>
            <Link href="/track-order" className="hover:text-slate-800">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
