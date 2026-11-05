
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Plus,
    RefreshCw,
    AlertCircle,
    LayoutDashboard,
} from "lucide-react";
import FrameLoading from "@/components/FrameLoading";
import HostBookingRequests from "@/components/HostBookingRequests";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type Studio = {
    _id: string;
    title?: string;
    name?: string;
};

type Booking = {
    _id: string;
    studioTitle?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: "Pending" | "Confirmed" | "Completed" | "Cancelled";
    total?: number;
};

type ListingsResponse = {
    success: boolean;
    studios: Studio[];
    count?: number;
};

type BookingsResponse = {
    success: boolean;
    bookings: Booking[];
    count?: number;
};

const statusStyle: Record<string, string> = {
    Pending:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    Confirmed:
        "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    Completed:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    Cancelled:
        "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
};

function prettyDate(date?: string) {
    if (!date) return "Date not set";

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    if (!match) return date;

    const value = new Date(
        Date.UTC(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        )
    );

    return Number.isNaN(value.getTime())
        ? date
        : value.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
        });
}

export default function DashboardPage() {
    const {
        data: session,
        isPending: sessionLoading,
    } = authClient.useSession();

    const [studios, setStudios] = useState<Studio[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [listingsError, setListingsError] = useState("");
    const [bookingsError, setBookingsError] = useState("");

    const loadDashboard = useCallback(async () => {
        setLoading(true);

        const [listingResult, bookingResult] = await Promise.all([
            apiRequest<ListingsResponse>("/api/my-listings", {
                cache: "no-store",
                timeoutMs: 15000,
                retries: 1,
            }),
            apiRequest<BookingsResponse>("/api/bookings/mine", {
                cache: "no-store",
                timeoutMs: 15000,
                retries: 1,
            }),
        ]);

        if (listingResult.success) {
            setStudios(
                Array.isArray(listingResult.data.studios)
                    ? listingResult.data.studios
                    : []
            );
            setListingsError("");
        } else {
            setStudios([]);
            setListingsError(listingResult.message);
        }

        if (bookingResult.success) {
            setBookings(
                Array.isArray(bookingResult.data.bookings)
                    ? bookingResult.data.bookings
                    : []
            );
            setBookingsError("");
        } else {
            setBookings([]);
            setBookingsError(bookingResult.message);
        }

        setLoading(false);
    }, []);

    const userId = session?.user?.id;

    useEffect(() => {
        if (sessionLoading || !userId) return;

        const id = window.setTimeout(() => {
            void loadDashboard();
        }, 0);

        return () => window.clearTimeout(id);
    }, [sessionLoading, userId, loadDashboard]);

    if (sessionLoading) {
        return (
            <FrameLoading
                variant="dashboard"
                title="dashboard"
            />
        );
    }

    if (!session?.user) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-[#FAFAFA] px-5 py-20 text-neutral-950 dark:bg-[#111111] dark:text-white">
                <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#191919] sm:p-12">
                    <LayoutDashboard
                        className="mx-auto mb-5 text-[#E60023]"
                        size={40}
                    />

                    <h1 className="text-3xl font-bold tracking-tight">
                        Your Frame dashboard
                    </h1>

                    <p className="mt-3 text-neutral-600 dark:text-neutral-400">
                        Sign in to see your studios, bookings, and account shortcuts.
                    </p>

                    <Link
                        href="/login?redirect=%2Fdashboard"
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#E60023] px-6 py-3 font-semibold text-white transition hover:bg-[#c9001f]"
                    >
                        Sign in
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </main>
        );
    }

    const counts = {
        pending: bookings.filter(
            (booking) => booking.status === "Pending"
        ).length,
        confirmed: bookings.filter(
            (booking) => booking.status === "Confirmed"
        ).length,
        completed: bookings.filter(
            (booking) => booking.status === "Completed"
        ).length,
    };

    const recentBookings = [...bookings]
        .sort((a, b) =>
            (b.date ?? "").localeCompare(a.date ?? "")
        )
        .slice(0, 4);

    const cards = [
        {
            label: "My studios",
            value: studios.length,
            icon: Building2,
            href: "/my-listings",
        },
        {
            label: "Total bookings",
            value: bookings.length,
            icon: CalendarDays,
            href: "/my-bookings",
        },
        {
            label: "Pending",
            value: counts.pending,
            icon: Clock3,
            href: "/my-bookings",
        },
        {
            label: "Confirmed",
            value: counts.confirmed,
            icon: CheckCircle2,
            href: "/my-bookings",
        },
    ];

    return (
        <main className="min-h-[75vh] bg-[#FAFAFA] px-4 pb-24 pt-12 text-neutral-950 dark:bg-[#111111] dark:text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#E60023]">
                            Your workspace
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                            Welcome back, {session.user.name || "creator"}.
                            Here&apos;s your Frame overview.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadDashboard()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-neutral-400 disabled:opacity-60 dark:border-white/15 dark:bg-[#1C1C1C] dark:hover:border-white/40"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {(listingsError || bookingsError) && (
                    <div
                        role="alert"
                        className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    >
                        <AlertCircle
                            size={20}
                            className="shrink-0"
                        />

                        <div>
                            <p className="font-semibold">
                                Some dashboard information could not be loaded.
                            </p>

                            {listingsError && (
                                <p>Studios: {listingsError}</p>
                            )}

                            {bookingsError && (
                                <p>Bookings: {bookingsError}</p>
                            )}

                            <p className="mt-1">
                                Use Refresh to try again. Unavailable counts
                                are not confirmed totals.
                            </p>
                        </div>
                    </div>
                )}

                <section
                    aria-label="Account statistics"
                    className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-[#E60023]/40 hover:bg-neutral-50 dark:border-white/10 dark:bg-[#1C1C1C] dark:hover:bg-white/5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    {card.label}
                                </span>

                                <card.icon
                                    size={21}
                                    className="text-[#E60023]"
                                />
                            </div>

                            <p className="mt-5 text-4xl font-bold tabular-nums">
                                {loading
                                    ? "…"
                                    : (card.label === "My studios" &&
                                        listingsError) ||
                                        (card.label !== "My studios" &&
                                            bookingsError)
                                        ? "—"
                                        : card.value}
                            </p>

                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E60023]">
                                View details
                                <ArrowRight size={13} />
                            </span>
                        </Link>
                    ))}
                </section>

                <div className="mt-9 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C] sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Recent bookings
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    Your latest reservations
                                </p>
                            </div>

                            <Link
                                href="/my-bookings"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-[#E60023] hover:underline"
                            >
                                All bookings
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        {loading ? (
                            <p
                                className="py-14 text-center text-sm text-neutral-500"
                                role="status"
                            >
                                Loading bookings…
                            </p>
                        ) : bookingsError ? (
                            <p className="py-14 text-center text-sm text-neutral-500">
                                Booking information is currently unavailable.
                            </p>
                        ) : recentBookings.length === 0 ? (
                            <div className="py-12 text-center">
                                <CalendarDays
                                    size={30}
                                    className="mx-auto text-neutral-400"
                                />

                                <p className="mt-3 font-semibold">
                                    No bookings yet
                                </p>

                                <p className="mt-1 text-sm text-neutral-500">
                                    Explore studios to make your first reservation.
                                </p>

                                <Link
                                    href="/studios"
                                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#E60023]"
                                >
                                    Explore studios
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-5 divide-y divide-neutral-100 dark:divide-white/10">
                                {recentBookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">
                                                {booking.studioTitle ||
                                                    "Studio reservation"}
                                            </p>

                                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                                {prettyDate(booking.date)}

                                                {booking.startTime
                                                    ? ` · ${booking.startTime}${booking.endTime
                                                        ? `–${booking.endTime}`
                                                        : ""
                                                    }`
                                                    : ""}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[booking.status || ""] ||
                                                statusStyle.Pending
                                                }`}
                                        >
                                            {booking.status || "Pending"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C] sm:p-7">
                        <h2 className="text-xl font-bold">
                            Quick actions
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Pick up where you left off
                        </p>

                        <div className="mt-6 space-y-3">
                            {[
                                {
                                    href: "/add-studio",
                                    title: "Add a new studio",
                                    detail: "Publish a creative space",
                                    icon: Plus,
                                },
                                {
                                    href: "/my-listings",
                                    title: "Manage my studios",
                                    detail: "Edit or remove your listings",
                                    icon: Building2,
                                },
                                {
                                    href: "/my-bookings",
                                    title: "Manage my bookings",
                                    detail: "Review and cancel eligible bookings",
                                    icon: CalendarDays,
                                },
                                {
                                    href: "/studios",
                                    title: "Explore studios",
                                    detail: "Discover a space to book",
                                    icon: ArrowRight,
                                },
                            ].map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4 transition hover:border-[#E60023]/40 hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E60023] dark:bg-red-500/10">
                                        <action.icon size={19} />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold">
                                            {action.title}
                                        </span>

                                        <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                                            {action.detail}
                                        </span>
                                    </span>

                                    <ArrowRight
                                        size={16}
                                        className="shrink-0 text-neutral-400"
                                    />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <HostBookingRequests userId={userId || ""} />

                {!loading &&
                    !bookingsError &&
                    counts.completed > 0 && (
                        <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">
                            Completed bookings: {counts.completed}
                        </p>
                    )}
            </div>
        </main>
    );
}
