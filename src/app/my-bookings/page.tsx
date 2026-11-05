
"use client";

import FrameLoading from "@/components/FrameLoading";
import { bookingCompleted } from "@/lib/booking-time";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    Camera,
    CheckCircle2,
    Clock3,
    Download,
    LoaderCircle,
    MapPin,
    RefreshCw,
    X,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { apiRequest, downloadBookingInvoice } from "@/lib/api";

type BookingStatus =
    | "Pending"
    | "Confirmed"
    | "Completed"
    | "Cancelled";

type Booking = {
    _id: string;
    studioId: string;
    studioTitle?: string;
    studioImage?: string;
    studioLocation?: string;
    date: string;
    startTime: string;
    endTime: string;
    hours?: number;
    crewCount?: number;
    notes?: string;
    hourlyRate?: number;
    subtotal?: number;
    securityDeposit?: number;
    total?: number;
    status: BookingStatus;
    createdAt?: string;
};

type BookingsResponse = {
    success: boolean;
    count: number;
    bookings: Booking[];
};

type CancelResponse = {
    success: boolean;
    message: string;
    booking?: Booking;
};

const money = (value: number | undefined) =>
    `$${Number(value ?? 0).toLocaleString("en-US", {
        maximumFractionDigits: 2,
    })}`;

// Shared Frame booking action styles.
// Explicit important dark hover classes prevent theme overrides.
const bookingActionBase =
    "inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-center text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

const bookingActionOutline =
    `${bookingActionBase} ` +
    "border-neutral-200 bg-white text-neutral-900 " +
    "hover:!border-[#E60023] hover:!bg-[#F4CDD3] hover:!text-[#E60023] " +
    "focus-visible:!border-[#E60023] " +
    "dark:!border-white/20 dark:!bg-[#242426] dark:!text-white " +
    "dark:hover:!border-[#E60023] dark:hover:!bg-[#49151C] dark:hover:!text-[#FF6B7A]";

const bookingActionPrimary =
    `${bookingActionBase} ` +
    "border-[#E60023] bg-[#E60023] text-white " +
    "hover:!border-[#C9001F] hover:!bg-[#C9001F] hover:!text-white " +
    "focus-visible:!border-[#C9001F] " +
    "dark:!border-[#E60023] dark:!bg-[#E60023] dark:!text-white " +
    "dark:hover:!border-[#C9001F] dark:hover:!bg-[#C9001F] dark:hover:!text-white";

function formatDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) {
        return date;
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return time;
    }

    const hour = hours % 12 || 12;
    const period = hours >= 12 ? "PM" : "AM";

    return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function calculateHours(booking: Booking) {
    if (typeof booking.hours === "number") {
        return booking.hours;
    }

    const [startHour, startMinute] = booking.startTime
        .split(":")
        .map(Number);

    const [endHour, endMinute] = booking.endTime
        .split(":")
        .map(Number);

    const difference =
        endHour * 60 +
        endMinute -
        (startHour * 60 + startMinute);

    return Math.max(0, difference / 60);
}

const statusStyles: Record<BookingStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-50 text-[#E60023] border-red-200",
};

const statusLabels: Record<BookingStatus, string> = {
    Pending: "Pending",
    Confirmed: "Confirmed",
    Completed: "Completed",
    Cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: BookingStatus }) {
    const safeStatus = statusStyles[status] ? status : "Pending";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[safeStatus]}`}
        >
            {safeStatus === "Confirmed" ||
                safeStatus === "Completed" ? (
                <CheckCircle2 size={13} />
            ) : safeStatus === "Cancelled" ? (
                <XCircle size={13} />
            ) : (
                <Clock3 size={13} />
            )}

            {statusLabels[safeStatus]}
        </span>
    );
}

function BookingImage({
    src,
    title,
}: {
    src?: string;
    title: string;
}) {
    if (!src) {
        return (
            <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 sm:h-28 sm:w-32">
                <Camera size={29} />
            </div>
        );
    }

    return (
        // Studio images may come from external host-provided URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={title}
            className="h-28 w-full shrink-0 rounded-xl bg-neutral-100 object-cover sm:h-28 sm:w-32"
        />
    );
}

function CancellationModal({
    booking,
    cancelling,
    onClose,
    onConfirm,
}: {
    booking: Booking;
    cancelling: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !cancelling) {
                onClose();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [cancelling, onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/65 px-4 py-6 backdrop-blur-[3px]"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !cancelling
                ) {
                    onClose();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="cancel-booking-title"
                aria-describedby="cancel-booking-description"
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-[#E60023]">
                            <AlertCircle size={22} />
                        </div>

                        <div>
                            <h2
                                id="cancel-booking-title"
                                className="text-xl font-semibold text-neutral-950"
                            >
                                Cancel Pending Reservation
                            </h2>

                            <p className="mt-1 text-xs font-medium text-[#E60023]">
                                Free cancellation policy
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={cancelling}
                        aria-label="Close cancellation dialog"
                        className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#E60023] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                <p
                    id="cancel-booking-description"
                    className="mt-6 text-sm leading-7 text-neutral-600"
                >
                    Are you sure you want to cancel your reservation for{" "}
                    <strong className="text-neutral-950">
                        {booking.studioTitle || "this studio"}
                    </strong>{" "}
                    on{" "}
                    <strong className="text-neutral-950">
                        {formatDate(booking.date)}
                    </strong>{" "}
                    from{" "}
                    <strong className="text-neutral-950">
                        {formatTime(booking.startTime)} to{" "}
                        {formatTime(booking.endTime)}
                    </strong>
                    ?
                </p>

                <p className="mt-3 text-xs leading-5 text-neutral-500">
                    Your booking status will change to Cancelled.
                    This action cannot be undone.
                </p>

                <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={cancelling}
                        className={bookingActionOutline}
                    >
                        Keep Booking
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={cancelling}
                        className={bookingActionPrimary}
                    >
                        {cancelling ? (
                            <>
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />
                                Cancelling...
                            </>
                        ) : (
                            "Confirm Cancellation"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyBookingsPage() {
    const router = useRouter();

    const { data: session, isPending: sessionLoading } =
        authClient.useSession();

    const userId = session?.user?.id;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelTarget, setCancelTarget] =
        useState<Booking | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [downloadingId, setDownloadingId] =
        useState<string | null>(null);

    const cancellingRef = useRef(false);

    const loadBookings = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError("");

        const result = await apiRequest<BookingsResponse>(
            "/api/bookings/mine",
            {
                cache: "no-store",
                timeoutMs: 15000,
            }
        );

        if (!result.success) {
            if (result.status === 401) {
                router.replace(
                    "/login?redirect=%2Fmy-bookings"
                );
                return;
            }

            setError(result.message);
            setLoading(false);
            return;
        }

        if (!result.data?.success) {
            setError("Unable to load your bookings.");
            setLoading(false);
            return;
        }

        setBookings(result.data.bookings || []);
        setLoading(false);
    }, [userId, router]);

    useEffect(() => {
        if (sessionLoading) return;

        if (!userId) {
            router.replace(
                "/login?redirect=%2Fmy-bookings"
            );
            return;
        }

        const controller = new AbortController();

        Promise.resolve().then(() => {
            if (!controller.signal.aborted) {
                void loadBookings();
            }
        });

        return () => {
            controller.abort();
        };
    }, [sessionLoading, userId, router, loadBookings]);

    const closeCancellation = useCallback(() => {
        if (!cancellingRef.current) {
            setCancelTarget(null);
        }
    }, []);

    async function confirmCancellation() {
        if (!cancelTarget || cancellingRef.current) return;

        if (cancelTarget.status !== "Pending") {
            toast.error(
                "Only pending bookings can be cancelled."
            );
            setCancelTarget(null);
            return;
        }

        cancellingRef.current = true;
        setCancelling(true);

        const targetId = cancelTarget._id;

        try {
            const result = await apiRequest<CancelResponse>(
                `/api/bookings/${encodeURIComponent(
                    targetId
                )}/cancel`,
                {
                    method: "PATCH",
                    timeoutMs: 15000,
                }
            );

            if (!result.success) {
                if (result.status === 401) {
                    toast.error("Please sign in again.");
                    router.replace(
                        "/login?redirect=%2Fmy-bookings"
                    );
                    return;
                }

                toast.error(result.message);
                return;
            }

            if (!result.data?.success) {
                toast.error(
                    result.data?.message ||
                    "Unable to cancel your booking."
                );
                return;
            }

            setBookings((current) =>
                current.map((booking) =>
                    booking._id === targetId
                        ? {
                            ...booking,
                            status: "Cancelled",
                        }
                        : booking
                )
            );

            setCancelTarget(null);
            toast.success(
                "Booking cancelled successfully."
            );
        } catch {
            toast.error(
                "Unable to cancel your booking. Please try again."
            );
        } finally {
            cancellingRef.current = false;
            setCancelling(false);
        }
    }

    async function handleDownloadInvoice(
        bookingId: string
    ) {
        if (downloadingId) return;

        setDownloadingId(bookingId);

        try {
            const result =
                await downloadBookingInvoice(bookingId);

            if (result.success) {
                toast.success(
                    "Invoice downloaded successfully."
                );
            } else {
                toast.error(result.message);

                if (result.status === 401) {
                    router.replace(
                        "/login?redirect=%2Fmy-bookings"
                    );
                }
            }
        } finally {
            setDownloadingId(null);
        }
    }

    if (sessionLoading || !userId || loading) {
        return (
            <FrameLoading
                variant="dashboard"
                title="my bookings"
            />
        );
    }

    return (
        <main className="min-h-[70vh] bg-neutral-50 pb-24 text-neutral-950">
            <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8 lg:pt-14">
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#E60023]">
                            <CalendarDays size={14} />
                            YOUR RESERVATIONS
                        </span>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                            My Bookings
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-neutral-500">
                            Track your studio reservations, shoot
                            times, and booking statuses.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E60023] px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#C9001F]"
                    >
                        Explore More Studios
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {error ? (
                    <div className="mt-10 rounded-2xl border border-red-100 bg-white px-6 py-10 text-center">
                        <AlertCircle
                            size={32}
                            className="mx-auto text-[#E60023]"
                        />

                        <h2 className="mt-4 text-xl font-semibold">
                            Couldn&apos;t load your bookings
                        </h2>

                        <p className="mt-2 text-sm text-neutral-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                void loadBookings()
                            }
                            className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-[#E60023]">
                            <CalendarDays size={30} />
                        </div>

                        <h2 className="mt-5 text-2xl font-semibold">
                            No bookings yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                            Your studio reservations will
                            appear here. Explore creative
                            spaces and book your first workspace.
                        </p>

                        <Link
                            href="/studios"
                            className="mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            Explore Studios
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-medium text-neutral-600">
                                {bookings.length}{" "}
                                {bookings.length === 1
                                    ? "reservation"
                                    : "reservations"}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    void loadBookings()
                                }
                                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-[#E60023]"
                            >
                                <RefreshCw size={15} />
                                Refresh
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {bookings.map((booking) => (
                                <article
                                    key={booking._id}
                                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                                >
                                    <div className="flex flex-col gap-5 md:flex-row">
                                        <Link
                                            href={`/studios/${booking.studioId}`}
                                            className="shrink-0"
                                            aria-label={`View ${booking.studioTitle ||
                                                "studio"
                                                }`}
                                        >
                                            <BookingImage
                                                src={
                                                    booking.studioImage
                                                }
                                                title={
                                                    booking.studioTitle ||
                                                    "Studio"
                                                }
                                            />
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge
                                                    status={
                                                        bookingCompleted(
                                                            booking
                                                        )
                                                            ? "Completed"
                                                            : booking.status
                                                    }
                                                />

                                                <span className="text-xs text-neutral-400">
                                                    ID: #
                                                    {booking._id.slice(
                                                        -7
                                                    )}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/studios/${booking.studioId}`}
                                                className="mt-3 block text-lg font-semibold text-neutral-950 transition-colors hover:text-[#E60023]"
                                            >
                                                {booking.studioTitle ||
                                                    "Creative Workspace"}
                                            </Link>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarDays
                                                        size={15}
                                                        className="text-[#E60023]"
                                                    />
                                                    {formatDate(
                                                        booking.date
                                                    )}
                                                </span>

                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock3
                                                        size={15}
                                                        className="text-[#E60023]"
                                                    />
                                                    {formatTime(
                                                        booking.startTime
                                                    )}
                                                    {" – "}
                                                    {formatTime(
                                                        booking.endTime
                                                    )}{" "}
                                                    (
                                                    {calculateHours(
                                                        booking
                                                    )}{" "}
                                                    hrs)
                                                </span>
                                            </div>

                                            {booking.studioLocation && (
                                                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-400">
                                                    <MapPin
                                                        size={13}
                                                    />
                                                    {
                                                        booking.studioLocation
                                                    }
                                                </p>
                                            )}

                                            {typeof booking.crewCount ===
                                                "number" && (
                                                    <p className="mt-2 text-xs text-neutral-500">
                                                        Crew:{" "}
                                                        {
                                                            booking.crewCount
                                                        }{" "}
                                                        {booking.crewCount ===
                                                            1
                                                            ? "person"
                                                            : "people"}
                                                    </p>
                                                )}
                                        </div>

                                        {/* Price and actions — no vertical divider */}
                                        <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-neutral-100 pt-4 md:min-w-40 md:items-end md:border-t-0 md:py-0 md:pl-5">
                                            <div className="md:text-right">
                                                <p className="text-xs text-neutral-400">
                                                    Estimated total
                                                </p>

                                                <p className="mt-1 text-2xl font-bold text-[#E60023]">
                                                    {money(
                                                        booking.total
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex w-full flex-col gap-2.5 md:w-auto md:items-end">
                                                {(booking.status ===
                                                    "Confirmed" ||
                                                    booking.status ===
                                                    "Completed") && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                downloadingId !==
                                                                null
                                                            }
                                                            onClick={() =>
                                                                void handleDownloadInvoice(
                                                                    booking._id
                                                                )
                                                            }
                                                            className={
                                                                bookingActionOutline
                                                            }
                                                        >
                                                            {downloadingId ===
                                                                booking._id ? (
                                                                <LoaderCircle
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Download
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}

                                                            {downloadingId ===
                                                                booking._id
                                                                ? "Preparing PDF..."
                                                                : "Download Invoice"}
                                                        </button>
                                                    )}

                                                {bookingCompleted(
                                                    booking
                                                ) && (
                                                        <Link
                                                            href={`/studios/${booking.studioId}#creator-reviews`}
                                                            className={
                                                                bookingActionPrimary
                                                            }
                                                        >
                                                            Write or manage
                                                            review
                                                        </Link>
                                                    )}

                                                {booking.status ===
                                                    "Pending" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCancelTarget(
                                                                    booking
                                                                )
                                                            }
                                                            className={
                                                                bookingActionOutline
                                                            }
                                                        >
                                                            <XCircle
                                                                size={15}
                                                            />
                                                            Cancel Booking
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {cancelTarget && (
                <CancellationModal
                    booking={cancelTarget}
                    cancelling={cancelling}
                    onClose={closeCancellation}
                    onConfirm={() =>
                        void confirmCancellation()
                    }
                />
            )}
        </main>
    );
}
