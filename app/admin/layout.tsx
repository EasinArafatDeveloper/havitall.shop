'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Image as ImageIcon, 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
  X, 
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { success, error, info } = useToast();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const authStatus = localStorage.getItem('havitall_admin_auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (!isLoginPage) {
        router.replace('/admin/login');
      }
    }
  }, [pathname, isLoginPage, router]);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Hero Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Supplier & Sync', href: '/admin/supplier', icon: RefreshCw },
  ];

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset demo data with luxury presets?')) return;
    try {
      setIsSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        success('Database successfully seeded with fresh luxury presets!');
        window.location.reload();
      } else {
        error(data.error || 'Failed to seed database');
      }
    } catch (err) {
      error('Failed to reset database.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('havitall_admin_auth');
    document.cookie = 'havitall_admin_auth=; path=/; max-age=0';
    info('Logged out from admin panel');
    router.replace('/admin/login');
  };

  // If on login page, render login page directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If checking authentication, show loading
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Verifying secure admin credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 text-white border-b border-slate-900">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black text-sm">
            H
          </div>
          <span className="font-bold text-white font-display">HavItAll Admin</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-900 p-6 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight font-display text-white block">
                HavIt<span className="text-slate-400 font-serif italic font-normal">All</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Admin Control Hub
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="space-y-3 pt-6 border-t border-slate-900">
          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetData}
            disabled={isSeeding}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 max-w-7xl bg-slate-50 text-slate-900">
        {children}
      </div>
    </div>
  );
}
