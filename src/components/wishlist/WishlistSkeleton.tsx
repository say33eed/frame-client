export default function WishlistSkeleton() {
    return (
        <div
            className="animate-pulse"
            role="status"
            aria-label="Loading saved studios"
            aria-busy="true"
        >
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-3">
                    <div className="h-3 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-10 w-64 max-w-full rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-72 max-w-full rounded-md bg-neutral-200 dark:bg-neutral-800" />
                </div>

                <div className="h-10 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-[#1C1C1C]"
                    >
                        <div className="relative aspect-[4/3] bg-neutral-200 dark:bg-neutral-800">
                            <div className="absolute right-3 top-3 h-11 w-11 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="h-3 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-6 w-4/5 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-2/3 rounded-md bg-neutral-200 dark:bg-neutral-700" />

                            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-white/10">
                                <div className="h-5 w-24 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-4 w-20 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <span className="sr-only">
                Loading your saved studios. Please wait.
            </span>
        </div>
    );
}