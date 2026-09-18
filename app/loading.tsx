import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero banner shape */}
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl sm:rounded-3xl aspect-[21/9] bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Product grid shape */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-6 w-48 rounded-full bg-slate-200 animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
