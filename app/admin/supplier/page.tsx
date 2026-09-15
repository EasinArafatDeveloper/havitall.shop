'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  ExternalLink, 
  ShieldAlert, 
  ShoppingBag,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminSupplierPage() {
  const [apiKey, setApiKey] = useState('bkr_5c498792bc7a89dbc6c1426c141ef8c8a581bd577865feb0');
  const [origin, setOrigin] = useState('https://havitall.shop');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { success, error, info } = useToast();

  const handleSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!apiKey.trim()) {
      error('Please enter a valid Business Koro API Key');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/businesskoro/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          origin: origin.trim(),
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        success(data.message || `Successfully connected and synced ${data.count} products! 🎉`);
      } else {
        error(data.error || 'Failed to connect with Business Koro API');
      }
    } catch (err: any) {
      error(err.message || 'Network error while testing connection');
      setResult({ success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 border border-slate-200 flex items-center justify-center font-bold text-xs">
            BK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Business Koro Supplier & Live Sync
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Connect your Business Koro Reseller API to automatically import real products, live stock, and auto-dispatch orders to suppliers.
        </p>
      </div>

      {/* Sync Card Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-950" />
            <span className="text-sm font-bold text-slate-950">API Credentials & Whitelist</span>
          </div>
          <a
            href="https://businesskoro.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-600 hover:text-slate-950 font-semibold flex items-center gap-1"
          >
            <span>Open Business Koro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSync} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Business Koro API Key *</span>
              <span className="text-[10px] text-slate-400 font-normal">Copy from Business Koro Dashboard</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="bkr_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-500">
              💡 <strong>Important:</strong> Business Koro ড্যাশবোর্ডে গিয়ে নীল <strong>"কপি"</strong> বাটনে ক্লিক করে পুরো API Key টি এখানে পেস্ট করুন।
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Origin / Whitelisted Domain
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://havitall.shop"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Testing & Syncing Products...' : 'Test Connection & Sync Real Products'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Status Feedback Box */}
      {result && (
        <div
          className={`rounded-3xl p-6 border transition-all ${
            result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-sm text-slate-950">
                {result.success ? 'Connected Successfully!' : 'API Connection Failed'}
              </h4>
              <p className="text-xs leading-relaxed">
                {result.message || result.error}
              </p>

              {!result.success && result.status === 401 && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-700 space-y-1.5 shadow-sm">
                  <p className="font-bold text-amber-700">কীভাবে এটি ঠিক করবেন:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Business Koro ড্যাশবোর্ডে গিয়ে <strong>API Key</strong> বক্সের পাশের নীল <strong>"কপি"</strong> বাটনে ক্লিক করুন।</li>
                    <li>যদি কী রি-জেনারেট করে থাকেন, তবে নতুন কপি করা কী-টি উপরের বক্সে পেস্ট করে <strong>"Test Connection & Sync Real Products"</strong>-এ ক্লিক করুন।</li>
                    <li>হোয়াইটলিস্ট অপশনে <code>havitall.shop</code> লিখে <strong>"সেভ করুন"</strong> বাটন ক্লিক করেছেন কিনা নিশ্চিত করুন।</li>
                  </ol>
                </div>
              )}

              {result.success && result.count > 0 && (
                <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{result.count} real products are now live on your website!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs text-slate-600 space-y-3 shadow-sm">
        <h4 className="font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-950" />
          How Business Koro Real Sync Works
        </h4>
        <ul className="space-y-2 leading-relaxed">
          <li>• <strong>লাইভ প্রোডাক্ট ফেচ:</strong> বিজনেস করো API থেকে স্বয়ংক্রিয়ভাবে প্রোডাক্টের নাম, ছবি, বিবরণ এবং রিয়েল স্টক লোড হয়।</li>
          <li>• <strong>অটোমেটিক ড্রপশিপিং:</strong> ওয়েবসাইটে কাস্টমার অর্ডার করার সাথে সাথে অর্ডারটি বিজনেস করোর কাছে চলে যায়, যাতে তারা পার্সেল পাঠিয়ে দিতে পারে।</li>
          <li>• <strong>স্মার্ট ব্যাকআপ:</strong> কোনো কারণে সাপ্লায়ারের API সাময়িক অফলাইন থাকলে সাইট কখনোই ব্ল্যাঙ্ক হবে না—স্মুথ ব্যাকআপ ডাটাবেজ প্রদর্শিত থাকবে।</li>
        </ul>
      </div>
    </div>
  );
}
