export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse bg-hairline ${className}`} />
}

export function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div aria-hidden className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
