'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  Phone,
  ShieldAlert,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Play a pleasant, rich e-commerce chime using Web Audio API
export function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Tone 1: Note G5 (784 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Tone 2: Note C6 (1046.5 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.45, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);

    // Tone 3: Harmonic E6 (1318.5 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1318.51, now + 0.25);
    gain3.gain.setValueAtTime(0, now + 0.25);
    gain3.gain.linearRampToValueAtTime(0.3, now + 0.30);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.25);
    osc3.stop(now + 1.1);
  } catch (err) {
    console.error('Failed to synthesize order sound:', err);
  }
}

export interface AdminOrderAlert {
  _id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  itemsCount: number;
  itemNames: string;
  createdAt: string;
  isOffer?: boolean;
}

export default function AdminOrderNotifier() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [browserNotifPermission, setBrowserNotifPermission] = useState<NotificationPermission>('default');
  const [activeAlert, setActiveAlert] = useState<AdminOrderAlert | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AdminOrderAlert[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastKnownOrderRef = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize sound preference and notification permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSound = localStorage.getItem('havitall_admin_sound');
      if (storedSound !== null) {
        setSoundEnabled(storedSound === 'true');
      }

      if ('Notification' in window) {
        setBrowserNotifPermission(Notification.permission);
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('havitall_admin_sound', String(next));
    if (next) {
      playOrderChime();
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotifPermission(permission);
        if (permission === 'granted') {
          new Notification('🎉 HavItAll নোটিফিকেশন সক্রিয়!', {
            body: 'স্যার, নতুন কোনো কাস্টমার অর্ডার করার সাথে সাথে এখানে এলার্ট পাবেন।',
            icon: '/icon',
          });
        }
      } catch (err) {
        console.error('Notification permission error:', err);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for new incoming orders
  const checkForNewOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?limit=5');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !Array.isArray(data.orders) || data.orders.length === 0) return;

      const latestOrder = data.orders[0];
      const latestOrderNumber = latestOrder.orderNumber || latestOrder._id;

      // On first boot, record current latest order as baseline
      if (!lastKnownOrderRef.current) {
        lastKnownOrderRef.current = latestOrderNumber;
        setIsInitialized(true);
        return;
      }

      // Check if there is a NEW order that we haven't alerted for yet
      if (latestOrderNumber !== lastKnownOrderRef.current) {
        // Collect all new orders between lastKnown and latest
        const newOrders: any[] = [];
        for (const ord of data.orders) {
          const ordNum = ord.orderNumber || ord._id;
          if (ordNum === lastKnownOrderRef.current) break;
          newOrders.push(ord);
        }

        // Update baseline
        lastKnownOrderRef.current = latestOrderNumber;

        if (newOrders.length > 0) {
          const newest = newOrders[0];
          const alertObj: AdminOrderAlert = {
            _id: newest._id,
            orderNumber: newest.orderNumber || 'New Order',
            customerName: newest.customer?.fullName || 'Customer',
            phone: newest.customer?.phone || '',
            totalAmount: newest.totalAmount || 0,
            itemsCount: newest.items?.length || 1,
            itemNames: newest.items?.map((i: any) => i.name).join(', ') || 'Luxury Product',
            createdAt: newest.createdAt || new Date().toISOString(),
            isOffer: newest.items?.some((i: any) => i.isOffer),
          };

          // 1. Trigger Sound if enabled
          if (soundEnabled) {
            playOrderChime();
          }

          // 2. Trigger Native Browser Push Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const notif = new Notification(`🔔 স্যার, নতুন অর্ডার এসেছে! (${alertObj.orderNumber})`, {
                body: `কাস্টমার: ${alertObj.customerName} (${alertObj.phone})\nমোট অ্যামাউন্ট: ৳${alertObj.totalAmount.toLocaleString()}\nপণ্য: ${alertObj.itemNames}`,
                icon: '/icon',
                badge: '/icon',
                tag: alertObj.orderNumber,
              });

              notif.onclick = () => {
                window.focus();
                router.push('/admin/orders');
              };
            } catch (err) {
              console.error('Failed to trigger native notification:', err);
            }
          }

          // 3. Show In-App Floating Alert
          setActiveAlert(alertObj);
          setRecentAlerts((prev) => [alertObj, ...prev.slice(0, 9)]);
          setUnreadCount((prev) => prev + newOrders.length);
        }
      }
    } catch (err) {
      // Ignore background fetch errors
    }
  }, [soundEnabled, router]);

  // Set up polling interval (every 8 seconds)
  useEffect(() => {
    checkForNewOrders();
    const interval = setInterval(checkForNewOrders, 8000);
    return () => clearInterval(interval);
  }, [checkForNewOrders]);

  // Test notification simulation
  const handleTestAlert = () => {
    playOrderChime();
    const testAlert: AdminOrderAlert = {
      _id: 'test_' + Date.now(),
      orderNumber: `HAV-TEST${Math.floor(100 + Math.random() * 900)}`,
      customerName: 'Ashraful Islam (Test)',
      phone: '01712345678',
      totalAmount: 2450,
      itemsCount: 2,
      itemNames: 'K8 Wireless Earbuds, Luxury Watch',
      createdAt: new Date().toISOString(),
      isOffer: true,
    };

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🔔 টেস্ট এলার্ট: নতুন অর্ডার এসেছে! (${testAlert.orderNumber})`, {
        body: `কাস্টমার: ${testAlert.customerName} • মোট: ৳${testAlert.totalAmount}\nপণ্য: ${testAlert.itemNames}`,
        icon: '/icon',
      });
    }

    setActiveAlert(testAlert);
    setRecentAlerts((prev) => [testAlert, ...prev.slice(0, 9)]);
    setUnreadCount((prev) => prev + 1);
  };

  return (
    <>
      {/* 1. Header Bar Controls (Placed seamlessly inside Admin Topbar) */}
      <div className="flex items-center gap-2">
        {/* Real-time Order Listening Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Order Listener Active</span>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            soundEnabled
              ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
          }`}
          title={soundEnabled ? 'সাউন্ড এলার্ট চালু আছে (Mute করতে ক্লিক করুন)' : 'সাউন্ড এলার্ট বন্ধ (Unmute করতে ক্লিক করুন)'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline text-[11px] text-slate-500">Muted</span>
            </>
          )}
        </button>

        {/* Browser Notification Permission Button (if not granted) */}
        {browserNotifPermission !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
            title="ব্রাউজার পুশ নোটিফিকেশন চালু করুন"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>Enable Push</span>
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setUnreadCount(0);
            }}
            className="relative p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="অর্ডার নোটিফিকেশন ট্রে"
          >
            {unreadCount > 0 ? (
              <BellRing className="w-4 h-4 text-rose-600 animate-bounce" />
            ) : (
              <Bell className="w-4 h-4 text-slate-700" />
            )}

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-950" />
                    <span className="font-bold text-xs text-slate-950">
                      Recent Order Alerts ({recentAlerts.length})
                    </span>
                  </div>
                  <button
                    onClick={handleTestAlert}
                    className="text-[10px] font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs"
                  >
                    <Play className="w-2.5 h-2.5 fill-slate-900" /> Test Sound
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                  {recentAlerts.length === 0 ? (
                    <div className="p-6 text-center space-y-2 text-slate-500">
                      <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold">কোনো নতুন অর্ডার আসেনি</p>
                      <p className="text-[10px] text-slate-400">
                        কাস্টমার ওয়েবসাইট থেকে অর্ডার করলে এখানে লাইভ সাউন্ড সহ নোটিফিকেশন আসবে।
                      </p>
                    </div>
                  ) : (
                    recentAlerts.map((alert, idx) => (
                      <div
                        key={alert._id || idx}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/admin/orders');
                        }}
                        className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-950 group-hover:text-rose-600 transition-colors">
                            {alert.orderNumber}
                          </span>
                          <span className="text-xs font-black text-emerald-600">
                            ৳{alert.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium truncate">
                          {alert.customerName} • {alert.phone}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {alert.itemNames}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-xs font-bold text-slate-900 hover:text-rose-600 transition-colors block py-1"
                  >
                    View All Orders & Dispatch →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Floating High-Priority Order Alert Toast Banner */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-5 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-slate-950 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20 shrink-0">
                  <BellRing className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                    <span>🔔 স্যার, নতুন অর্ডার এসেছে!</span>
                  </h4>
                  <span className="text-[11px] font-bold text-amber-300">
                    Order #{activeAlert.orderNumber}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Details Body */}
            <div className="mt-3.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">কাস্টমার:</span>
                <span className="font-bold text-white">{activeAlert.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ফোন:</span>
                <span className="font-semibold text-slate-200">{activeAlert.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">মোট মূল্য:</span>
                <span className="font-black text-amber-300 text-sm">৳{activeAlert.totalAmount.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 truncate">
                <span className="text-slate-500">আইটেম:</span> {activeAlert.itemNames}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveAlert(null);
                  router.push('/admin/orders');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>অর্ডার দেখুন ও অ্যাপ্রুভ করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveAlert(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
