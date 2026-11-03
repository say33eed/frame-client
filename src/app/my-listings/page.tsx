
"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Building2,
    LoaderCircle,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    ShieldAlert,
    Trash2,
    X,
} from "lucide-react";
import { Toaster, toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type Studio = {
    _id: string;
    title?: string;
    name?: string;
    category?: string;
    location?: string;
    address?: string;
    imageUrl?: string;
    images?: string[];
    pricePerHour?: number;
    hourlyRate?: number;
    securityDeposit?: number;
    maxCapacity?: number;
};

type MyListingsResponse = {
    success: boolean;
    count: number;
    studios: Studio[];
};

type DeleteStudioResponse = {
    success: boolean;
    message: string;
    deletedStudioId: string;
};

function studioName(studio: Studio) {
    return studio.title || studio.name || "Untitled studio";
}

function formatMoney(value: number | undefined) {
    return `$${Number(value ?? 0).toLocaleString("en-US")}`;
}

function StudioThumbnail({
    studio,
}: {
    studio: Studio;
}) {
    const [failed, setFailed] = useState(false);
    const image = studio.imageUrl || studio.images?.[0];

    if (!image || failed) {
        return (
            <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                <Building2 size={23} aria-hidden="true" />
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={image}
            alt=""
            className="h-14 w-16 shrink-0 rounded-xl bg-neutral-100 object-cover"
            onError={() => setFailed(true)}
        />
    );
}

export default function MyListingsPage() {
    const { data: session, isPending } =
        authClient.useSession();

    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [studioToDelete, setStudioToDelete] =
        useState<Studio | null>(null);

    const [deleting, setDeleting] = useState(false);

    const loadListings = useCallback(async () => {
        setLoading(true);
        setError("");

        const result = await apiRequest<MyListingsResponse>(
            "/api/my-listings",
            {
                cache: "no-store",
                timeoutMs: 15000,
            }
        );

        if (result.success) {
            setStudios(result.data.studios ?? []);
        } else {
            setStudios([]);
            setError(result.message);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!isPending && session?.user) {
            const timeoutId = window.setTimeout(() => {
                void loadListings();
            }, 0);

            return () => window.clearTimeout(timeoutId);
        }
    }, [isPending, session?.user, loadListings]);

    // Close the confirmation dialog with Escape.
    useEffect(() => {
        if (!studioToDelete || deleting) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setStudioToDelete(null);
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [studioToDelete, deleting]);

    async function handleDeleteStudio() {
        if (
            !studioToDelete ||
            deleting ||
            !session?.user
        ) {
            return;
        }

        const selectedStudio = studioToDelete;

        setDeleting(true);

        const result =
            await apiRequest<DeleteStudioResponse>(
                `/api/studios/manage/${encodeURIComponent(
                    selectedStudio._id
                )}`,
                {
                    method: "DELETE",
                    timeoutMs: 15000,
                }
            );

        setDeleting(false);

        if (!result.success) {
            toast.error("Unable to delete studio", {
                description:
                    result.status === 401
                        ? "Your session has expired. Please sign in again."
                        : result.message,
            });
            return;
        }

        setStudioToDelete(null);

        // Update the table immediately.
        setStudios((previous) =>
            previous.filter(
                (studio) => studio._id !== selectedStudio._id
            )
        );

        toast.success("Studio deleted successfully", {
            description: `${studioName(
                selectedStudio
            )} has been removed from your listings.`,
        });

        // Synchronize with the actual MongoDB data.
        void loadListings();
    }

    if (isPending) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center">
                <LoaderCircle
                    className="animate-spin text-[#E60023]"
                    size={30}
                    aria-label="Checking your session"
                />
            </main>
        );
    }

    if (!session?.user) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#FAFAFA] px-5">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
                    <ShieldAlert
                        size={36}
                        className="mx-auto text-[#E60023]"
                        aria-hidden="true"
                    />

                    <h1 className="mt-5 text-2xl font-bold text-neutral-950">
                        Sign in to manage your studios
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                        Your published studios are available only
                        when you&apos;re signed in to your Frame account.
                    </p>

                    <Link
                        href="/login?redirect=%2Fmy-listings"
                        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white transition hover:bg-[#C9001F]"
                    >
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <>
            <Toaster
                position="top-right"
                richColors
                closeButton
            />

            <main className="min-h-[75vh] bg-[#FAFAFA] px-4 pb-24 pt-14 text-neutral-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#E60023]">
                                <Building2
                                    size={14}
                                    aria-hidden="true"
                                />
                                Host Workspace Manager
                            </span>

                            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                My Studio Listings
                            </h1>

                            <p className="mt-2 text-sm text-neutral-500 sm:text-base">
                                Manage your published creative spaces,
                                rates, and studio details.
                            </p>
                        </div>

                        <Link
                            href="/add-studio"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition hover:bg-[#C9001F]"
                        >
                            <Plus
                                size={17}
                                aria-hidden="true"
                            />
                            Add New Studio
                        </Link>
                    </header>

                    {loading ? (
                        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
                            <LoaderCircle
                                size={28}
                                className="animate-spin text-[#E60023]"
                                aria-label="Loading your listings"
                            />
                        </div>
                    ) : error ? (
                        <div
                            role="alert"
                            className="rounded-2xl border border-red-200 bg-white p-8 text-center"
                        >
                            <ShieldAlert
                                size={30}
                                className="mx-auto text-[#E60023]"
                                aria-hidden="true"
                            />

                            <h2 className="mt-4 text-lg font-semibold">
                                Unable to load your listings
                            </h2>

                            <p className="mt-2 text-sm text-neutral-500">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => void loadListings()}
                                className="mt-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-50"
                            >
                                <RefreshCw
                                    size={16}
                                    aria-hidden="true"
                                />
                                Try Again
                            </button>
                        </div>
                    ) : studios.length === 0 ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#E60023]">
                                <Building2
                                    size={30}
                                    aria-hidden="true"
                                />
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
                                No studios published yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
                                Publish your first creative space to
                                start managing it here.
                            </p>

                            <Link
                                href="/add-studio"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E60023] px-6 py-3 text-sm font-semibold text-white hover:bg-[#C9001F]"
                            >
                                <Plus
                                    size={17}
                                    aria-hidden="true"
                                />
                                Add Your First Studio
                            </Link>
                        </div>
                    ) : (
                        <section
                            aria-label="Your published studios"
                            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
                                <p className="text-sm font-semibold text-neutral-800">
                                    Published Studios
                                </p>

                                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                                    {studios.length}{" "}
                                    {studios.length === 1
                                        ? "listing"
                                        : "listings"}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-4"
                                            >
                                                Studio Space
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-4"
                                            >
                                                Category
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-4"
                                            >
                                                Hourly Rate
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-4"
                                            >
                                                Deposit
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-4"
                                            >
                                                Capacity
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-right"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-neutral-100">
                                        {studios.map((studio) => (
                                            <tr
                                                key={studio._id}
                                                className="transition-colors hover:bg-neutral-50/80"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex min-w-64 items-center gap-3">
                                                        <StudioThumbnail
                                                            studio={studio}
                                                        />

                                                        <div className="min-w-0">
                                                            <Link
                                                                href={`/studios/${studio._id}`}
                                                                className="block max-w-72 truncate font-semibold text-neutral-950 hover:text-[#E60023]"
                                                            >
                                                                {studioName(studio)}
                                                            </Link>

                                                            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                                                <MapPin
                                                                    size={12}
                                                                    className="shrink-0 text-[#E60023]"
                                                                    aria-hidden="true"
                                                                />

                                                                <span className="max-w-64 truncate">
                                                                    {studio.location ||
                                                                        studio.address ||
                                                                        "Location not specified"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="inline-flex whitespace-nowrap rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">
                                                        {studio.category ||
                                                            "Uncategorized"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 font-bold text-[#E60023]">
                                                    {formatMoney(
                                                        studio.pricePerHour ??
                                                        studio.hourlyRate
                                                    )}
                                                    <span className="text-xs font-medium">
                                                        /hr
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-neutral-600">
                                                    {formatMoney(
                                                        studio.securityDeposit
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-neutral-600">
                                                    {studio.maxCapacity ?? "—"}{" "}
                                                    people
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/studios/${studio._id}`}
                                                            aria-label={`View ${studioName(
                                                                studio
                                                            )}`}
                                                            title="View Studio"
                                                            className="rounded-lg p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
                                                        >
                                                            <ArrowUpRight
                                                                size={18}
                                                                aria-hidden="true"
                                                            />
                                                        </Link>

                                                        <Link
                                                            href={`/studios/edit/${studio._id}`}
                                                            title="Edit Studio"
                                                            aria-label={`Edit ${studioName(
                                                                studio
                                                            )}`}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#E60023]"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setStudioToDelete(studio)
                                                            }
                                                            title="Delete Studio"
                                                            aria-label={`Delete ${studioName(
                                                                studio
                                                            )}`}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                                                        >
                                                            <Trash2
                                                                size={17}
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Custom confirmation modal */}
            {studioToDelete && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleting
                        ) {
                            setStudioToDelete(null);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-studio-title"
                        aria-describedby="delete-studio-description"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#E60023]">
                                <Trash2
                                    size={25}
                                    aria-hidden="true"
                                />
                            </div>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    setStudioToDelete(null)
                                }
                                aria-label="Close confirmation"
                                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50"
                            >
                                <X
                                    size={20}
                                    aria-hidden="true"
                                />
                            </button>
                        </div>

                        <h2
                            id="delete-studio-title"
                            className="mt-6 text-2xl font-bold text-neutral-950"
                        >
                            Delete Studio?
                        </h2>

                        <p
                            id="delete-studio-description"
                            className="mt-3 text-sm leading-relaxed text-neutral-600"
                        >
                            Are you sure you want to delete{" "}
                            <strong className="text-neutral-950">
                                {studioName(studioToDelete)}
                            </strong>
                            ? This action permanently removes the
                            studio from your listings and cannot be
                            undone.
                        </p>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    setStudioToDelete(null)
                                }
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    void handleDeleteStudio()
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition hover:bg-[#C9001F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={17}
                                            aria-hidden="true"
                                        />
                                        Delete Studio
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
