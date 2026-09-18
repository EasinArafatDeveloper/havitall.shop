export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="aspect-square w-full bg-slate-200" />

      {/* Info area */}
      <div className="flex flex-col p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-16 rounded-full bg-slate-200" />
          <div className="h-2.5 w-10 rounded-full bg-slate-200" />
        </div>
        <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
        <div className="h-2.5 w-1/2 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-14 rounded-full bg-slate-200" />
          <div className="h-8 w-8 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
