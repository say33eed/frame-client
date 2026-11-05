"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Heart,
    ArrowRight,
    MapPin,
    RefreshCw,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import WishlistButton from "@/components/wishlist/WishlistButton";
import WishlistSkeleton from "@/components/wishlist/WishlistSkeleton";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

type Studio = {
    _id: string;
    title?: string;
    name?: string;
    imageUrl?: string;
    location?: string;
    address?: string;
    hourlyRate?: number;
    pricePerHour?: number;
    category?: string;
};

type WishlistResponse = {
    success: boolean;
    studios: Studio[];
    studioIds: string[];
};

export default function WishlistPage() {
    const {
        data: session,
        isPending,
    } = authClient.useSession();

    const {
        savedIds,
        loading: wishlistLoading,
        refresh,
    } = useWishlist();

    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = session?.user?.id;

    const load = useCallback(async () => {
        if (!userId) {
            setStudios([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await apiRequest<WishlistResponse>(
                "/api/wishlist",
                {
                    cache: "no-store",
                }
            );

            if (result.success) {
                setStudios(result.data.studios || []);
            } else {
                setError(
                    result.message ||
                    "Unable to load your wishlist."
                );
            }
        } catch {
            setError(
                "Something went wrong while loading your wishlist."
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isPending) return;

        let cancelled = false;

        Promise.resolve().then(() => {
            if (!cancelled) {
                void load();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [isPending, load]);

    useEffect(() => {
        const listener = () => {
            void load();
        };

        window.addEventListener(
            "frame:wishlist-changed",
            listener
        );

        return () => {
            window.removeEventListener(
                "frame:wishlist-changed",
                listener
            );
        };
    }, [load]);

    const handleRefresh = async () => {
        await Promise.all([
            refresh(),
            load(),
        ]);
    };

    if (isPending) {
        return (
            <main className="min-h-[70vh] bg-neutral-50 px-5 py-14 text-neutral-950 dark:bg-[#111111] dark:text-white sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <WishlistSkeleton />
                </div>
            </main>
        );
    }

    if (!userId) {
        return (
            <main className="mx-auto max-w-3xl px-5 py-24 text-center">
                <Heart
                    size={42}
                    className="mx-auto text-[#E60023]"
                />

                <h1 className="mt-5 text-3xl font-bold">
                    Your saved studios
                </h1>

                <p className="mt-3 text-neutral-500">
                    Sign in to save studios and access your
                    wishlist across devices.
                </p>

                <Link
                    href="/login?redirect=%2Fwishlist"
                    className="mt-7 inline-flex rounded-full bg-[#E60023] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#C9001F]"
                >
                    Sign in
                </Link>
            </main>
        );
    }

    const visible = studios.filter((studio) =>
        savedIds.has(studio._id)
    );

    if (loading || wishlistLoading) {
        return (
            <main className="min-h-[70vh] bg-neutral-50 px-5 py-14 text-neutral-950 dark:bg-[#111111] dark:text-white sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <WishlistSkeleton />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[70vh] bg-neutral-50 px-5 py-14 text-neutral-950 dark:bg-[#111111] dark:text-white sm:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Page header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E60023]">
                            Your collection
                        </p>

                        <h1 className="mt-2 text-4xl font-bold">
                            Saved Wishlist
                        </h1>

                        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                            Keep your favorite creative spaces
                            in one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            void handleRefresh();
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:border-[#E60023] dark:border-white/20 dark:bg-[#222] dark:text-white"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div
                        role="alert"
                        className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => {
                                void handleRefresh();
                            }}
                            className="mt-3 text-sm font-semibold underline underline-offset-4"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {visible.length === 0 && !error ? (
                    <div className="mt-12 rounded-3xl border border-neutral-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#1C1C1C]">
                        <Heart
                            size={40}
                            className="mx-auto text-[#E60023]"
                        />

                        <h2 className="mt-5 text-2xl font-bold">
                            Your wishlist is empty
                        </h2>

                        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                            Tap the heart on any studio to save it
                            here.
                        </p>

                        <Link
                            href="/studios"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E60023] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            Explore studios
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    /* Saved studio grid */
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((studio) => (
                            <article
                                key={studio._id}
                                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-[#E60023]/40 dark:border-white/10 dark:bg-[#1C1C1C]"
                            >
                                {/* Studio image */}
                                <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800">
                                    {studio.imageUrl ? (
                                        <Image
                                            src={studio.imageUrl}
                                            alt={
                                                studio.title ||
                                                studio.name ||
                                                "Studio"
                                            }
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center px-4 text-center text-neutral-500">
                                            Studio image unavailable
                                        </div>
                                    )}

                                    <WishlistButton
                                        studioId={studio._id}
                                        className="absolute right-3 top-3"
                                    />
                                </div>

                                {/* Studio information */}
                                <div className="p-5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#E60023]">
                                        {studio.category ||
                                            "Creative Space"}
                                    </p>

                                    <h2 className="mt-2 text-xl font-bold">
                                        {studio.title ||
                                            studio.name ||
                                            "Untitled studio"}
                                    </h2>

                                    <p className="mt-2 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                                        <MapPin
                                            size={15}
                                            className="shrink-0"
                                        />

                                        <span>
                                            {studio.location ||
                                                studio.address ||
                                                "Location not specified"}
                                        </span>
                                    </p>

                                    {/* Price and details */}
                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-white/10">
                                        <span className="font-semibold">
                                            $
                                            {Number(
                                                studio.hourlyRate ??
                                                studio.pricePerHour ??
                                                0
                                            ).toLocaleString()}{" "}
                                            / hr
                                        </span>

                                        <Link
                                            href={`/studios/${encodeURIComponent(
                                                studio._id
                                            )}`}
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#E60023] hover:underline"
                                        >
                                            View details
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}