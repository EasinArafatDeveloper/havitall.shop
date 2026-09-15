import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones, Zap } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Free fast shipping across Bangladesh for all orders over ৳1,500.",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic Guaranteed",
    description: "Sourced directly from verified global manufacturers & ateliers.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: RefreshCw,
    title: "7-Day Easy Returns",
    description: "Not completely satisfied? Seamless replacement or instant refund.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Headphones,
    title: "24/7 Priority Support",
    description: "Live concierge helpline and instant order assistance anytime.",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
];

export default function TrustFeatures() {
  return (
    <section className="py-10 bg-dark-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-dark-200/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className={`p-3 rounded-xl border shrink-0 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
