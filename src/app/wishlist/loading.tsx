import WishlistSkeleton from "@/components/wishlist/WishlistSkeleton";

export default function WishlistLoading() {
    return (
        <main className="min-h-[70vh] bg-neutral-50 px-5 py-14 text-neutral-950 dark:bg-[#111111] dark:text-white sm:px-8">
            <div className="mx-auto max-w-7xl">
                <WishlistSkeleton />
            </div>
        </main>
    );
}