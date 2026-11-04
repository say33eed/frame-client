
"use client";

import StudioCardSkeleton from "@/components/StudioCardSkeleton";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    Camera,
    MapPin,
    RefreshCw,
    Star,
    WifiOff,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Studio = {
    _id: string;
    title?: string;
    name?: string;
    category?: string;
    location?: string;
    address?: string;
    hourlyRate?: number;
    pricePerHour?: number;
    imageUrl?: string;
    rating?: number;
};

type FeaturedResponse = {
    success: boolean;
    count?: number;
    studios: Studio[];
};

function getTitle(studio: Studio) {
    return studio.title || studio.name || "Untitled Studio";
}

function getLocation(studio: Studio) {
    return studio.location || studio.address || "Location not specified";
}

function getPrice(studio: Studio) {
    return Number(studio.hourlyRate ?? studio.pricePerHour ?? 0);
}

export default function FeaturedStudios() {
    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadFeaturedStudios = useCallback(async () => {
        setLoading(true);
        setError("");

        const result = await apiRequest<FeaturedResponse>(
            "/api/studios/featured",
            { cache: "no-store" }
        );

        if (result.success && Array.isArray(result.data.studios)) {
            setStudios(result.data.studios.slice(0, 6));
        } else {
            setStudios([]);
            setError(
                result.success
                    ? "The featured studio response was invalid."
                    : result.message
            );
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;

        Promise.resolve().then(() => {
            if (!cancelled) {
                void loadFeaturedStudios();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [loadFeaturedStudios]);

    return (
        <section
            id="featured-studios"
            aria-labelledby="featured-heading"
            className="bg-white border px-5 py-20 sm:px-8 lg:py-28"
        >
            <div className="mx-auto max-w-7xl">
                {/* ORIGINAL SECTION HEADER */}
                <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E60023]">
                            Discover Frame
                        </p>

                        <h2
                            id="featured-heading"
                            className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
                        >
                            Featured Studios
                        </h2>

                        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
                            Explore spaces made for your next big creative idea.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-neutral-950 transition-colors hover:text-[#E60023]"
                    >
                        View all studios
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </div>

                {/* LOADING SKELETONS */}
                {loading ? (
                    <StudioCardSkeleton />
                ) : error ? (
                    /* BACKEND UNAVAILABLE */
                    <div
                        role="status"
                        className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center"
                    >
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm">
                            <WifiOff size={25} aria-hidden="true" />
                        </div>

                        <h3 className="text-xl font-semibold text-neutral-950">
                            Featured studios are temporarily unavailable
                        </h3>

                        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                            We couldn&apos;t load the featured spaces right now.
                            Please try again shortly.
                        </p>

                        <button
                            type="button"
                            onClick={() => void loadFeaturedStudios()}
                            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            <RefreshCw size={16} aria-hidden="true" />
                            Try Again
                        </button>
                    </div>
                ) : studios.length === 0 ? (
                    /* ORIGINAL EMPTY STATE */
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm">
                            <Camera size={25} aria-hidden="true" />
                        </div>

                        <h3 className="text-xl font-semibold text-neutral-950">
                            Inspiring spaces are coming soon
                        </h3>

                        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                            Featured studios will appear here as hosts publish
                            their spaces on Frame.
                        </p>

                        <Link
                            href="/studios"
                            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            Explore Studios
                        </Link>
                    </div>
                ) : (
                    /* LIVE FEATURED STUDIO CARDS */
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {studios.map((studio) => (
                            <article
                                key={studio._id}
                                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-lg dark:hover:border-red-800"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                    {studio.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={studio.imageUrl}
                                            alt={getTitle(studio)}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
                                            <Camera size={32} aria-hidden="true" />
                                            <span className="text-sm">
                                                Studio image coming soon
                                            </span>
                                        </div>
                                    )}

                                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:bg-neutral-900/95 dark:text-white shadow-sm">
                                        {studio.category || "Creative Space"}
                                    </span>

                                    {typeof studio.rating === "number" && (
                                        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:bg-neutral-900/95 dark:text-white shadow-sm">
                                            <Star
                                                size={13}
                                                className="fill-amber-400 text-amber-400"
                                                aria-hidden="true"
                                            />
                                            {studio.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                <div className="p-6">
                                    <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                                        <MapPin
                                            size={15}
                                            className="shrink-0 text-[#E60023]"
                                            aria-hidden="true"
                                        />
                                        <span className="truncate">
                                            {getLocation(studio)}
                                        </span>
                                    </p>

                                    <h3 className="mt-3 truncate text-xl font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-[#E60023]">
                                        {getTitle(studio)}
                                    </h3>

                                    <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                                        <p className="text-sm text-neutral-500">
                                            <span className="text-xl font-bold text-neutral-950">
                                                ${getPrice(studio).toLocaleString("en-US")}
                                            </span>
                                            {" "}/ hr
                                        </p>

                                        <Link
                                            href={`/studios/${encodeURIComponent(studio._id)}`}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E60023] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                                        >
                                            View Details
                                            <ArrowRight size={16} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
