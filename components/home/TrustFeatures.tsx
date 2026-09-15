import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Free fast shipping across Bangladesh for all orders over ৳1,500.",
    color: "text-slate-950 bg-slate-100 border-slate-200",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic Guaranteed",
    description: "Sourced directly from verified global manufacturers & ateliers.",
    color: "text-slate-950 bg-slate-100 border-slate-200",
  },
  {
    icon: RefreshCw,
    title: "7-Day Easy Returns",
    description: "Not completely satisfied? Seamless replacement or instant refund.",
    color: "text-slate-950 bg-slate-100 border-slate-200",
  },
  {
    icon: Headphones,
    title: "24/7 Priority Support",
    description: "Live concierge helpline and instant order assistance anytime.",
    color: "text-slate-950 bg-slate-100 border-slate-200",
  },
];

export default function TrustFeatures() {
  return (
    <section className="py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className={`p-3 rounded-xl border shrink-0 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-display">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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

