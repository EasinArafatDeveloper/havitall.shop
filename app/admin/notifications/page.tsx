'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Send, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Monitor, 
  Tablet, 
  RefreshCw, 
  Trash2, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  Globe, 
  Clock, 
  Check, 
  AlertCircle,
  Plus,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Subscriber {
  _id: string;
  permission: 'granted' | 'denied' | 'default';
  userAgent: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  ip?: string;
  city?: string;
  country?: string;
  lastActiveAt?: string;
  createdAt: string;
}

interface BroadcastItem {
  _id: string;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  targetUrl: string;
  sentCount: number;
  successCount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  granted: number;
  denied: number;
  grantRate: number;
  desktopGranted: number;
  mobileGranted: number;
}

export default function AdminNotificationsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    granted: 0,
    denied: 0,
    grantRate: 0,
    desktopGranted: 0,
    mobileGranted: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'broadcast' | 'history'>('subscribers');
  const [statusFilter, setStatusFilter] = useState<'all' | 'granted' | 'denied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const { success, error } = useToast();

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '🔥 বিশেষ ফ্ল্যাশ সেল লাইভ!',
    message: 'আমাদের এক্সক্লুসিভ লাক্সারি কালেকশনে আজকের সীমিত সময়ের ধামাকা অফার উপভোগ করুন।',
    icon: '/favicon.ico',
    image: '',
    targetUrl: '/shop',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, bcastsRes] = await Promise.all([
        fetch('/api/notifications/subscribers'),
        fetch('/api/notifications/broadcast'),
      ]);

      const subsData = await subsRes.json();
      const bcastsData = await bcastsRes.json();

      if (subsData.success) {
        setSubscribers(subsData.subscribers || []);
        if (subsData.stats) setStats(subsData.stats);
      }

      if (bcastsData.success) {
        setBroadcasts(bcastsData.broadcasts || []);
      }
    } catch (err: any) {
      console.error('Error loading notification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      error('নোটিফিকেশনের শিরোনাম এবং বার্তা লিখুন।');
      return;
    }

    try {
      setSendingBroadcast(true);
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm),
      });

      const data = await res.json();
      if (data.success) {
        success(data.message || 'লাইভ পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে! 🎉');
        
        // Also trigger native browser notification locally if supported
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(broadcastForm.title, {
            body: broadcastForm.message,
            icon: broadcastForm.icon || '/favicon.ico',
          });
        }

        loadData();
        setActiveTab('history');
      } else {
        error(data.error || 'নোটিফিকেশন পাঠানো ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      error('এরর: ' + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleTestLocalNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      error('আপনার ব্রাউজারে নোটিফিকেশন সাপোর্ট করে না।');
      return;
    }

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification(broadcastForm.title, {
            body: broadcastForm.message,
            icon: broadcastForm.icon || '/favicon.ico',
          });
          success('টেস্ট নোটিফিকেশন আপনার ডিভাইসে পাঠানো হয়েছে! 🔔');
        } else {
          error('অনুগ্রহ করে আপনার ব্রাউজারে নোটিফিকেশন অনুমতি দিন।');
        }
      });
    } else {
      new Notification(broadcastForm.title, {
        body: broadcastForm.message,
        icon: broadcastForm.icon || '/favicon.ico',
      });
      success('টেস্ট নোটিফিকেশন আপনার ডিভাইসে পাঠানো হয়েছে! 🔔');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('আপনি কি এই গ্রাহকের রেকর্ড মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/notifications/subscribers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('গ্রাহক রেকর্ড মুছে ফেলা হয়েছে।');
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
        loadData();
      } else {
        error(data.error || 'মুছতে ব্যর্থ হয়েছে।');
      }
    } catch {
      error('মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const handleClearDenied = async () => {
    if (!confirm('আপনি কি সকল ব্লক/ডিনাই করা গ্রাহকদের রেকর্ড পরিষ্কার করতে চান?')) return;
    try {
      const res = await fetch('/api/notifications/subscribers?id=all_denied', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('সকল ডিনাই রেকর্ড সফলভাবে ক্লিয়ার করা হয়েছে!');
        loadData();
      } else {
        error(data.error || 'ক্লিয়ার করতে ব্যর্থ হয়েছে।');
      }
    } catch {
      error('ক্লিয়ার করতে ব্যর্থ হয়েছে।');
    }
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesStatus = statusFilter === 'all' || sub.permission === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      sub.browser?.toLowerCase().includes(q) ||
      sub.os?.toLowerCase().includes(q) ||
      sub.ip?.toLowerCase().includes(q) ||
      sub.userAgent?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-blue-600" />;
      case 'desktop':
      default:
        return <Monitor className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Bell className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
                Push Notifications Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                গ্রাহকদের লাইভ অনুমতি স্ট্যাটাস দেখুন এবং সরাসরি ব্রাউজার পুশ নোটিফিকেশন ব্রডকাস্ট করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all transform active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>Send Push Notification</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Granted / Allowed */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Allowed (অনুমতি দিয়েছে)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {stats.granted}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            {stats.desktopGranted} Desktop • {stats.mobileGranted} Mobile
          </span>
        </div>

        {/* Denied / Blocked */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Blocked (ব্লক করেছে)</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {stats.denied}
          </p>
          <span className="text-[11px] text-rose-700 font-semibold block">
            অনুমতি না দিয়ে ব্লক করা ডিভাইস
          </span>
        </div>

        {/* Opt-in Rate */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Opt-In Rate (অনুমতির হার)</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-xs">
              %
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {stats.grantRate}%
          </p>
          <span className="text-[11px] text-slate-500 font-semibold block">
            সর্বমোট {stats.total} জন ভিজিটর
          </span>
        </div>

        {/* Total Broadcasts */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Broadcasts Sent</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {broadcasts.length}
          </p>
          <span className="text-[11px] text-indigo-700 font-semibold block">
            লাইভ ব্রডকাস্ট নোটিফিকেশন লগ
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-slate-200/80 max-w-xl gap-1">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'subscribers'
              ? 'bg-white text-slate-950 shadow-md scale-100'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>১. গ্রাহক তালিকা ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'broadcast'
              ? 'bg-white text-slate-950 shadow-md scale-100'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
          }`}
        >
          <Send className="w-4 h-4 text-amber-500" />
          <span>২. নোটিফিকেশন পাঠান</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-950 shadow-md scale-100'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>৩. হিস্টোরি ({broadcasts.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBSCRIBERS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({subscribers.length})
              </button>

              <button
                onClick={() => setStatusFilter('granted')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'granted'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Allowed ({stats.granted})</span>
              </button>

              <button
                onClick={() => setStatusFilter('denied')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'denied'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Blocked ({stats.denied})</span>
              </button>
            </div>

            {/* Search Input & Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Search browser, OS, IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {stats.denied > 0 && (
                <button
                  onClick={handleClearDenied}
                  className="px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors shrink-0 cursor-pointer"
                  title="Clear all denied logs"
                >
                  Clear Blocked
                </button>
              )}
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredSubscribers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-900">কোনো গ্রাহক রেকর্ড পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500">ভিজিটর ওয়েবসাইটে ঢুকে নোটিফিকেশন এলাও বা ব্লক করলে এখানে দেখতে পাবেন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Status (অনুমতি স্ট্যাটাস)</th>
                      <th className="py-3.5 px-4">Browser & OS</th>
                      <th className="py-3.5 px-4">Device Type</th>
                      <th className="py-3.5 px-4">IP Address</th>
                      <th className="py-3.5 px-4">Time / Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSubscribers.map((sub) => {
                      const isGranted = sub.permission === 'granted';
                      const isDenied = sub.permission === 'denied';

                      return (
                        <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Status */}
                          <td className="py-3.5 px-4 sm:px-6">
                            {isGranted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                ALLOWED (সক্রিয়)
                              </span>
                            ) : isDenied ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                BLOCKED (বাতিল)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                                NOT ANSWERED
                              </span>
                            )}
                          </td>

                          {/* Browser & OS */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{sub.browser || 'Chrome'}</span>
                              <span className="text-slate-400 font-normal">on</span>
                              <span className="text-slate-700 font-semibold">{sub.os || 'Windows'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[220px] block mt-0.5">
                              {sub.userAgent}
                            </span>
                          </td>

                          {/* Device Type */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 capitalize font-semibold text-slate-800">
                              {getDeviceIcon(sub.deviceType)}
                              <span>{sub.deviceType || 'Desktop'}</span>
                            </div>
                          </td>

                          {/* IP */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {sub.ip || '127.0.0.1'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(sub.createdAt || Date.now()).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(sub._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete subscriber record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BROADCAST PUSH NOTIFICATION SENDER */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Composer */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950 font-display">
                  Compose Live Push Notification
                </h3>
                <p className="text-xs text-slate-500">
                  অনুমতি দেওয়া সকল {stats.granted} জন গ্রাহকের ডিভাইসে সরাসরি লাইভ নোটিফিকেশন পাঠাবে।
                </p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  ১. নোটিফিকেশনের শিরোনাম (Notification Title) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. 🔥 বিশেষ ফ্ল্যাশ সেল লাইভ!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-950"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  ২. নোটিফিকেশন বার্তা (Message Body) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="e.g. আমাদের এক্সক্লুসিভ কালেকশনে সীমিত সময়ের অফার উপভোগ করুন।"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              {/* Target Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  ৩. ক্লিক করলে যে পেজে যাবে (Destination Link / URL)
                </label>
                <input
                  type="text"
                  value={broadcastForm.targetUrl}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetUrl: e.target.value })}
                  placeholder="e.g. /shop, /shop?isHot=true, or /product/slug"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-950"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>
                    {sendingBroadcast
                      ? 'Sending to Subscribers...'
                      : `Send Push to All ${stats.granted} Subscribers`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleTestLocalNotification}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  🧪 Test on My Device
                </button>
              </div>
            </form>
          </div>

          {/* Live Mobile / Desktop Push Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Live Device Push Preview (ডিভাইসে কেমন দেখাবে):
              </span>

              {/* Windows / Mac OS Push Preview Notification Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-2 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
                      H
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">HavItAll Store</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {broadcastForm.title || 'Notification Title'}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {broadcastForm.message || 'Notification message description goes here.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-amber-400 font-mono">
                  <span>Opens: {broadcastForm.targetUrl || '/shop'}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-2">
                <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Subscribers will receive actual OS notification</span>
                </p>
                <p>ক্লিক করলে সরাসরি ডেস্টিনেশন লিংকে ব্রাউজার রিডাইরেক্ট হবে।</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BROADCAST HISTORY LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Sent Push Broadcast History ({broadcasts.length})
            </h3>
            <button
              onClick={() => setActiveTab('broadcast')}
              className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              + Send New Push
            </button>
          </div>

          {broadcasts.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">কোনো পূর্বের ব্রডকাস্ট হিস্টোরি পাওয়া যায়নি</p>
              <button
                onClick={() => setActiveTab('broadcast')}
                className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold"
              >
                Send First Notification
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        SENT TO {item.sentCount || 0} SUBSCRIBERS
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-950">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{item.message}</p>
                  </div>

                  <Link
                    href={item.targetUrl || '/shop'}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-bold text-xs shrink-0 self-end sm:self-center"
                  >
                    <span>Target URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
