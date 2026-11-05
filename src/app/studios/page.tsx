"use client";

import WishlistButton from "@/components/wishlist/WishlistButton";

import StudioCardSkeleton from "@/components/StudioCardSkeleton";
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    MapPin,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Star,
    WifiOff,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useStudioCategories } from "@/hooks/useStudioCategories";

type Studio = {
    _id: string;
    title?: string;
    name?: string;
    category: string;
    location?: string;
    address?: string;
    hourlyRate?: number;
    pricePerHour?: number;
    securityDeposit?: number;
    maxCapacity?: number;
    imageUrl?: string;
    rating?: number;
    overview?: string;
    description?: string;
    createdAt?: string;
};

type StudiosResponse = {
    success: boolean;
    count: number;
    studios: Studio[];
};



type SortOption =
    | "newest"
    | "price-low"
    | "price-high"
    | "rating";

function studioPrice(studio: Studio): number {
    return Number(
        studio.hourlyRate ?? studio.pricePerHour ?? 0
    );
}

function studioTitle(studio: Studio): string {
    return studio.title || studio.name || "Untitled studio";
}

function studioLocation(studio: Studio): string {
    return (
        studio.location ||
        studio.address ||
        "Location not specified"
    );
}

function ExploreStudiosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { categories: backendCategories } = useStudioCategories();
    const categories = [{ name: "All", slug: "" }, ...backendCategories];

    const selectedCategory =
        searchParams.get("category") || "";

    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterError, setFilterError] = useState("");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [sort, setSort] =
        useState<SortOption>("newest");

    const [minInput, setMinInput] = useState("");
    const [maxInput, setMaxInput] = useState("");

    const [minPrice, setMinPrice] =
        useState<number | null>(null);

    const [maxPrice, setMaxPrice] =
        useState<number | null>(null);

    const loadStudios = useCallback(async () => {
        setLoading(true);
        setError("");

        const query = selectedCategory
            ? `?category=${encodeURIComponent(
                selectedCategory
            )}`
            : "";

        const result = await apiRequest<StudiosResponse>(
            `/api/studios${query}`,
            {
                cache: "no-store",
            }
        );

        if (result.success) {
            setStudios(result.data.studios ?? []);
        } else {
            setStudios([]);
            setError(result.message);
        }

        setLoading(false);
    }, [selectedCategory]);

    useEffect(() => {
        let cancelled = false;

        Promise.resolve().then(() => {
            if (!cancelled) {
                void loadStudios();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [loadStudios]);

    function chooseCategory(slug: string) {
        router.push(
            slug
                ? `/studios?category=${encodeURIComponent(
                    slug
                )}`
                : "/studios"
        );
    }

    function applySearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearch(searchInput.trim());
    }

    function applyPrice() {
        const min =
            minInput.trim() === ""
                ? null
                : Number(minInput);

        const max =
            maxInput.trim() === ""
                ? null
                : Number(maxInput);

        if (
            (min !== null &&
                (!Number.isFinite(min) || min < 0)) ||
            (max !== null &&
                (!Number.isFinite(max) || max < 0)) ||
            (min !== null &&
                max !== null &&
                min > max)
        ) {
            setFilterError(
                "Please enter a valid hourly-rate range."
            );
            return;
        }

        setFilterError("");
        setMinPrice(min);
        setMaxPrice(max);
    }

    function resetFilters() {
        setSearchInput("");
        setSearch("");

        setMinInput("");
        setMaxInput("");

        setMinPrice(null);
        setMaxPrice(null);

        setSort("newest");
        setFilterError("");

        router.push("/studios");
    }

    const filteredStudios = useMemo(() => {
        const query = search.toLowerCase();

        const result = studios.filter((studio) => {
            const searchable = [
                studioTitle(studio),
                studioLocation(studio),
                studio.category,
                studio.overview,
                studio.description,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const price = studioPrice(studio);

            return (
                (!query || searchable.includes(query)) &&
                (minPrice === null ||
                    price >= minPrice) &&
                (maxPrice === null ||
                    price <= maxPrice)
            );
        });

        result.sort((a, b) => {
            if (sort === "price-low") {
                return studioPrice(a) - studioPrice(b);
            }

            if (sort === "price-high") {
                return studioPrice(b) - studioPrice(a);
            }

            if (sort === "rating") {
                return (
                    (b.rating ?? 0) -
                    (a.rating ?? 0)
                );
            }

            return (
                new Date(
                    b.createdAt ?? 0
                ).getTime() -
                new Date(
                    a.createdAt ?? 0
                ).getTime()
            );
        });

        return result;
    }, [
        studios,
        search,
        sort,
        minPrice,
        maxPrice,
    ]);

    return (
        <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#111111] pb-24 pt-14 text-neutral-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* PAGE HEADER */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        {/* <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#E60023]">
                            The Frame Marketplace
                        </span> */}

                        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Explore Creative Studios
                        </h1>

                        <p className="mt-2 text-sm text-neutral-500 sm:text-base">
                            Discover inspiring spaces for photography,
                            film, podcasts, music, and more.
                        </p>
                    </div>

                    <p className="text-sm text-neutral-500">
                        {loading
                            ? "Loading creative spaces..."
                            : `Showing ${filteredStudios.length
                            } creative ${filteredStudios.length === 1
                                ? "space"
                                : "spaces"
                            }`}
                    </p>
                </div>

                {/* SEARCH AND FILTERS */}
                <section
                    aria-label="Studio search and filters"
                    className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <form
                        onSubmit={applySearch}
                        className="flex flex-col gap-3 lg:flex-row"
                    >
                        <div className="relative flex-1">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                aria-hidden="true"
                            />

                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value
                                    )
                                }
                                placeholder="Search studios by title, category, or city..."
                                aria-label="Search studios"
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#E60023] focus:ring-2 focus:ring-red-100"
                            />
                        </div>

                        <button
                            type="submit"
                            className="h-12 rounded-xl bg-[#E60023] px-7 text-sm font-semibold text-white transition hover:bg-[#C9001F]"
                        >
                            Search
                        </button>

                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target.value as SortOption
                                )
                            }
                            aria-label="Sort studios"
                            className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#E60023] lg:min-w-48"
                        >
                            <option value="newest">
                                Sort: Newest Listings
                            </option>

                            <option value="price-low">
                                Price: Low to High
                            </option>

                            <option value="price-high">
                                Price: High to Low
                            </option>

                            <option value="rating">
                                Highest Rated
                            </option>
                        </select>
                    </form>

                    <div className="mt-4 flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 xl:flex-row xl:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                <SlidersHorizontal size={14} />
                                Category:
                            </span>

                            {categories.map((category) => (
                                <button
                                    key={category.slug}
                                    type="button"
                                    onClick={() =>
                                        chooseCategory(
                                            category.slug
                                        )
                                    }
                                    aria-pressed={
                                        selectedCategory ===
                                        category.slug
                                    }
                                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${selectedCategory ===
                                            category.slug
                                            ? "bg-[#E60023] text-white shadow-sm"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-neutral-500">
                                Rate:
                            </span>

                            <input
                                type="number"
                                min="0"
                                value={minInput}
                                onChange={(event) =>
                                    setMinInput(
                                        event.target.value
                                    )
                                }
                                placeholder="Min"
                                aria-label="Minimum hourly rate"
                                className="h-9 w-20 rounded-lg border border-neutral-200 px-2 text-xs outline-none focus:border-[#E60023]"
                            />

                            <span className="text-neutral-400">
                                –
                            </span>

                            <input
                                type="number"
                                min="0"
                                value={maxInput}
                                onChange={(event) =>
                                    setMaxInput(
                                        event.target.value
                                    )
                                }
                                placeholder="Max"
                                aria-label="Maximum hourly rate"
                                className="h-9 w-20 rounded-lg border border-neutral-200 px-2 text-xs outline-none focus:border-[#E60023]"
                            />

                            <button
                                type="button"
                                onClick={applyPrice}
                                className="h-9 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-700"
                            >
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                aria-label="Reset all filters"
                                title="Reset all filters"
                                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-[#E60023]"
                            >
                                <RotateCcw size={17} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* FILTER VALIDATION */}
                {filterError && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        {filterError}
                    </div>
                )}

                {/* BACKEND ERROR */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <WifiOff
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="flex-1">
                            <p className="font-semibold">
                                Studio service unavailable
                            </p>

                            <p className="mt-1">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                void loadStudios()
                            }
                            className="font-semibold underline underline-offset-2"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* LOADING SKELETONS */}
                {loading ? (
                    <StudioCardSkeleton />
                ) : filteredStudios.length > 0 ? (

                    /* STUDIO GRID */
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredStudios.map(
                            (studio) => (
                                <article
                                    key={studio._id}
                                    className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg dark:hover:border-red-800"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                        {studio.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={studio.imageUrl}
                                                alt={studioTitle(
                                                    studio
                                                )}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                                                Studio image coming soon
                                            </div>
                                        )}

                                        <WishlistButton studioId={studio._id} className="absolute right-4 top-4 z-10" />

                                        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:bg-neutral-900/95 dark:text-white shadow-sm">
                                            {studio.category}
                                        </span>

                                        <span className="absolute bottom-4 left-4 rounded-lg bg-neutral-950/90 px-3 py-1.5 text-sm font-bold text-white dark:bg-black/90">
                                            $
                                            {studioPrice(
                                                studio
                                            ).toLocaleString(
                                                "en-US"
                                            )}

                                            <span className="ml-1 text-xs font-normal text-neutral-300">
                                                / hr
                                            </span>
                                        </span>

                                        {typeof studio.rating ===
                                            "number" && (
                                                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-lg bg-neutral-950/90 px-2.5 py-1.5 text-xs font-semibold text-white dark:bg-black/90">
                                                    <Star
                                                        size={13}
                                                        className="fill-yellow-400 text-yellow-400"
                                                    />
                                                    {studio.rating.toFixed(
                                                        1
                                                    )}
                                                </span>
                                            )}
                                    </div>

                                    <div className="p-5">
                                        <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                                            <MapPin
                                                size={14}
                                                className="shrink-0 text-[#E60023]"
                                            />

                                            <span className="truncate">
                                                {studioLocation(
                                                    studio
                                                )}
                                            </span>
                                        </p>

                                        <h2 className="mt-2 truncate text-lg font-bold tracking-tight text-neutral-950 transition group-hover:text-[#E60023]">
                                            {studioTitle(
                                                studio
                                            )}
                                        </h2>

                                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-neutral-500">
                                            {studio.overview ||
                                                studio.description ||
                                                "Explore this creative space and discover what it offers."}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                                            <span>
                                                {studio.maxCapacity
                                                    ? `Up to ${studio.maxCapacity} creators`
                                                    : "Creative workspace"}
                                            </span>

                                            {typeof studio.securityDeposit ===
                                                "number" && (
                                                    <span>
                                                        Deposit: $
                                                        {
                                                            studio.securityDeposit
                                                        }
                                                    </span>
                                                )}
                                        </div>

                                        <Link
                                            href={`/studios/${encodeURIComponent(
                                                studio._id
                                            )}`}
                                            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-semibold text-white transition hover:bg-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                                        >
                                            View Details
                                            <ArrowRight
                                                size={16}
                                            />
                                        </Link>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                ) : (

                    /* EMPTY STATE */
                    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                            <Search
                                size={25}
                                className="text-[#E60023]"
                            />
                        </div>

                        <h2 className="mt-5 text-2xl font-bold">
                            No studios found
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                            {error
                                ? "We couldn't load studio listings right now."
                                : studios.length === 0
                                    ? "No studios have been listed yet. Be among the first to share a creative space."
                                    : "No studios match your current filters. Try a different category, search, or price range."}
                        </p>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold hover:bg-neutral-50"
                            >
                                Clear Filters
                            </button>

                            <Link
                                href="/add-studio"
                                className="rounded-full bg-[#E60023] px-6 py-3 text-sm font-semibold text-white hover:bg-[#C9001F]"
                            >
                                Host Your Space
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function ExploreStudiosPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#111111] px-4 py-20 text-center text-neutral-500">
                    Loading creative studios...
                </main>
            }
        >
            <ExploreStudiosContent />
        </Suspense>
    );
}
