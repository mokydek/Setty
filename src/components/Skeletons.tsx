// Skeleton loaders matching the design system: sharp rectangles, black/10
// shimmer, rounded-none. The shimmer is a subtle pulse - no gradients.

function Block({ className }: { className: string }) {
  return <div className={`rounded-none bg-black/10 animate-pulse ${className}`} />
}

export function AssetCardSkeleton() {
  return (
    <div className="rounded-none border border-black/20 bg-white p-4 flex flex-col">
      <Block className="aspect-square mb-4" />
      <Block className="h-2.5 w-16 mb-2" />
      <Block className="h-4 w-3/4 mb-2" />
      <Block className="h-3 w-1/2 mb-4" />
      <div className="flex items-center justify-between mt-auto">
        <Block className="h-4 w-12" />
        <Block className="h-8 w-24" />
      </div>
    </div>
  )
}

export function AssetGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <AssetCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function AssetDetailSkeleton() {
  return (
    <div className="px-8 py-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <Block className="aspect-square" />
        <div className="flex flex-col">
          <Block className="h-8 w-3/4 mb-4" />
          <Block className="h-3 w-32 mb-8" />
          <Block className="h-3 w-full mb-2" />
          <Block className="h-3 w-full mb-2" />
          <Block className="h-3 w-2/3 mb-8" />
          <div className="flex items-center justify-between mt-auto">
            <Block className="h-7 w-20" />
            <Block className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="rounded-none border border-black/20 bg-white p-6 flex items-center justify-between gap-4">
      <Block className="h-4 w-48" />
      <div className="flex items-center gap-4">
        <Block className="h-3 w-20" />
        <Block className="h-9 w-24" />
      </div>
    </div>
  )
}

export function RowListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, index) => (
        <RowSkeleton key={index} />
      ))}
    </div>
  )
}

// Themed Suspense fallback for lazy-loaded routes.
export function RouteFallback() {
  return (
    <div className="px-8 py-12">
      <Block className="h-8 w-64 mb-8" />
      <AssetGridSkeleton count={4} />
    </div>
  )
}
