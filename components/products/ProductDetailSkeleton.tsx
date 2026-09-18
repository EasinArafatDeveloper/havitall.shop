export default function ProductDetailSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <div className="h-2.5 w-10 rounded-full bg-slate-200" />
          <div className="h-2.5 w-3 rounded-full bg-slate-200" />
          <div className="h-2.5 w-20 rounded-full bg-slate-200" />
          <div className="h-2.5 w-3 rounded-full bg-slate-200" />
          <div className="h-2.5 w-28 rounded-full bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Image */}
          <div className="lg:col-span-6 animate-pulse">
            <div className="aspect-square w-full rounded-3xl bg-slate-200" />
          </div>

          {/* Info */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 animate-pulse">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded-full bg-slate-200" />
                <div className="h-4 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="h-8 w-4/5 rounded-full bg-slate-200" />
              <div className="h-9 w-40 rounded-full bg-slate-200" />
              <div className="space-y-2 pt-1">
                <div className="h-3 w-full rounded-full bg-slate-200" />
                <div className="h-3 w-5/6 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-12 w-32 rounded-xl bg-slate-200" />
                <div className="h-12 flex-1 rounded-xl bg-slate-200" />
                <div className="h-12 flex-1 rounded-xl bg-slate-200" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 rounded-xl bg-slate-200" />
                <div className="h-16 rounded-xl bg-slate-200" />
                <div className="h-16 rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
