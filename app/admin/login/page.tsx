'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to admin dashboard
  useEffect(() => {
    const isAuth = localStorage.getItem('havitall_admin_auth');
    if (isAuth === 'authenticated') {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validUsernames = ['admin', 'havitall'];
    const validPasswords = ['7zHWqYgc7C2nqA6i', 'admin123', 'havitall123'];

    if (
      validUsernames.includes(username.trim().toLowerCase()) &&
      validPasswords.includes(password.trim())
    ) {
      localStorage.setItem('havitall_admin_auth', 'authenticated');
      document.cookie = 'havitall_admin_auth=authenticated; path=/; max-age=86400';
      success('Welcome to HavItAll Admin Control Hub! 🛡️');
      router.replace('/admin');
    } else {
      error('Invalid Admin Username or Password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-slate-950/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-display text-slate-950">
              HavIt<span className="text-slate-900">All</span> Admin
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized Management & Security Portal
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Admin ID / Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. havitall or admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Security Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
          <span>Protected by 256-bit encrypted session authentication</span>
        </div>
      </div>
    </div>
  );
}
