export default function StudioCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading studios" className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="aspect-[4/3] animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-11 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading studios…</span>
    </div>
  );
}
