export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-slate-50 py-20">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-slate-950 animate-pulse" />
        <span className="relative text-white font-black text-xl font-display">H</span>
        <div className="absolute -inset-1.5 rounded-3xl border-2 border-slate-950/20 border-t-rose-600 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading HavItAll…</p>
    </div>
  );
}
