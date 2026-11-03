
"use client";

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    ImageIcon,
    LoaderCircle,
    LockKeyhole,
    MapPin,
    Plus,
    X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { useStudioCategories } from "@/hooks/useStudioCategories";

const AMENITY_OPTIONS = [
    "High-Speed Wi-Fi",
    "Professional Lighting",
    "Air Conditioning",
    "Changing Room",
    "Soundproofing",
    "Parking",
    "Restroom",
    "Power Outlets",
    "Green Screen",
    "Makeup Station",
    "Audio Equipment",
    "Camera Equipment",
];

type StudioFormValues = {
    title: string;
    category: string;
    pricePerHour: string;
    securityDeposit: string;
    maxCapacity: string;
    location: string;
    imageUrl: string;
    overview: string;
    amenities: string[];
};

type SavedStudio = {
    _id: string;
    title?: string;
    name?: string;
    category?: string;
    pricePerHour?: number;
    securityDeposit?: number;
    maxCapacity?: number;
    location?: string;
    imageUrl?: string;
    images?: string[];
    overview?: string;
    description?: string;
    amenities?: string[];
};

type StudioResponse = {
    success: boolean;
    studio: SavedStudio;
};

type SaveResponse = {
    success: boolean;
    message: string;
};

type StudioFormProps = {
    studioId?: string;
};

const INITIAL_VALUES: StudioFormValues = {
    title: "",
    category: "",
    pricePerHour: "",
    securityDeposit: "0",
    maxCapacity: "",
    location: "",
    imageUrl: "",
    overview: "",
    amenities: [],
};

const inputClass =
    "min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-[#E60023] focus:ring-2 focus:ring-red-100";

function FieldLabel({
    htmlFor,
    children,
}: {
    htmlFor: string;
    children: ReactNode;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-sm font-semibold text-neutral-800"
        >
            {children}
        </label>
    );
}

function LoadingScreen({ message }: { message: string }) {
    return (
        <main className="flex min-h-[65vh] flex-col items-center justify-center gap-3 bg-neutral-50">
            <LoaderCircle
                size={30}
                className="animate-spin text-[#E60023]"
                aria-hidden="true"
            />
            <p className="text-sm text-neutral-500">{message}</p>
        </main>
    );
}

export default function StudioForm({
    studioId,
}: StudioFormProps) {
    const router = useRouter();
    const isEditing = Boolean(studioId);
    const returnPath = isEditing ? "/my-listings" : "/";
    const currentPath = isEditing
        ? `/studios/edit/${studioId}`
        : "/add-studio";

    const { data: session, isPending } =
        authClient.useSession();

    const {
        categories,
        loading: categoriesLoading,
        usingFallback,
    } = useStudioCategories();

    const [form, setForm] =
        useState<StudioFormValues>(INITIAL_VALUES);

    const [customAmenity, setCustomAmenity] = useState("");
    const [imageFailed, setImageFailed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [savedStudio, setSavedStudio] =
        useState<SavedStudio | null>(null);
    const [loadError, setLoadError] = useState("");
    const [loadingStudio, setLoadingStudio] =
        useState(isEditing);

    // Retrieve the actual saved document from MongoDB.
    // The backend checks that this user owns the studio.
    useEffect(() => {
        if (!studioId || isPending || !session?.user) {
            return;
        }

        let active = true;

        async function loadStudio() {
            const result = await apiRequest<StudioResponse>(
                `/api/studios/manage/${encodeURIComponent(studioId!)}`,
                {
                    cache: "no-store",
                    timeoutMs: 15000,
                }
            );

            if (!active) return;

            if (!result.success) {
                setLoadError(result.message);
                setLoadingStudio(false);
                return;
            }

            setSavedStudio(result.data.studio);
            setLoadError("");
            setLoadingStudio(false);
        }

        void loadStudio();

        return () => {
            active = false;
        };
    }, [studioId, isPending, session?.user]);

    // Match the database category name to the form's slug.
    // This also handles categories loaded asynchronously.
    const savedCategory = savedStudio
        ? categories.find(
            (category) =>
                category.name === savedStudio.category ||
                category.slug === savedStudio.category
        )
        : undefined;

    const editInitialValues = useMemo<StudioFormValues | null>(() => {
        if (!savedStudio || categoriesLoading) {
            return null;
        }

        return {
            title: savedStudio.title || savedStudio.name || "",
            category: savedCategory?.slug || "",
            pricePerHour:
                savedStudio.pricePerHour === undefined
                    ? ""
                    : String(savedStudio.pricePerHour),
            securityDeposit: String(
                savedStudio.securityDeposit ?? 0
            ),
            maxCapacity:
                savedStudio.maxCapacity === undefined
                    ? ""
                    : String(savedStudio.maxCapacity),
            location: savedStudio.location || "",
            imageUrl:
                savedStudio.imageUrl ||
                savedStudio.images?.[0] ||
                "",
            overview:
                savedStudio.overview ||
                savedStudio.description ||
                "",
            amenities: Array.isArray(savedStudio.amenities)
                ? savedStudio.amenities
                : [],
        };
    }, [savedStudio, categoriesLoading, savedCategory?.slug]);

    // Keep initial values separate from user edits.
    // A keyed form below resets correctly for each studio.
    const [initializedStudioId, setInitializedStudioId] =
        useState<string | null>(null);

    const readyToInitialize =
        isEditing &&
        Boolean(studioId) &&
        Boolean(editInitialValues) &&
        initializedStudioId !== studioId;

    // Initialization occurs after data is loaded, not
    // synchronously inside an effect.
    useEffect(() => {
        if (!readyToInitialize || !editInitialValues) return;

        const timeoutId = window.setTimeout(() => {
            setForm(editInitialValues);
            setInitializedStudioId(studioId || null);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [
        readyToInitialize,
        studioId,
        editInitialValues,
    ]);

    function updateField(
        field: keyof Omit<StudioFormValues, "amenities">,
        value: string
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        if (field === "imageUrl") {
            setImageFailed(false);
        }
    }

    function toggleAmenity(amenity: string) {
        setForm((previous) => ({
            ...previous,
            amenities: previous.amenities.includes(amenity)
                ? previous.amenities.filter(
                    (item) => item !== amenity
                )
                : previous.amenities.length < 50
                    ? [...previous.amenities, amenity]
                    : previous.amenities,
        }));
    }

    function addCustomAmenity() {
        const amenity = customAmenity.trim();

        if (
            !amenity ||
            amenity.length > 100 ||
            form.amenities.length >= 50
        ) {
            return;
        }

        setForm((previous) => ({
            ...previous,
            amenities: previous.amenities.includes(amenity)
                ? previous.amenities
                : [...previous.amenities, amenity],
        }));

        setCustomAmenity("");
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            submitting ||
            !session?.user ||
            (isEditing && !savedStudio)
        ) {
            return;
        }

        setError("");
        setSuccess("");

        const title = form.title.trim();
        const location = form.location.trim();
        const overview = form.overview.trim();
        const imageUrl = form.imageUrl.trim();

        const category = categories.find(
            (item) => item.slug === form.category
        );

        if (!category) {
            setError("Please select a valid studio category.");
            return;
        }

        if (title.length < 5 || title.length > 150) {
            setError("Studio title must contain 5–150 characters.");
            return;
        }

        if (location.length < 5 || location.length > 300) {
            setError("Please enter a valid studio address.");
            return;
        }

        if (overview.length < 20 || overview.length > 10000) {
            setError(
                "Studio overview must contain 20–10,000 characters."
            );
            return;
        }

        const pricePerHour = Number(form.pricePerHour);
        const securityDeposit = Number(form.securityDeposit);
        const maxCapacity = Number(form.maxCapacity);

        if (
            !Number.isFinite(pricePerHour) ||
            pricePerHour <= 0 ||
            pricePerHour > 100000
        ) {
            setError("Enter a valid hourly rate greater than zero.");
            return;
        }

        if (
            !Number.isFinite(securityDeposit) ||
            securityDeposit < 0 ||
            securityDeposit > 1000000
        ) {
            setError("Enter a valid security deposit.");
            return;
        }

        if (
            !Number.isInteger(maxCapacity) ||
            maxCapacity < 1 ||
            maxCapacity > 10000
        ) {
            setError("Maximum capacity must be a positive whole number.");
            return;
        }

        if (imageUrl) {
            try {
                const url = new URL(imageUrl);

                if (
                    url.protocol !== "http:" &&
                    url.protocol !== "https:"
                ) {
                    throw new Error("Invalid image URL");
                }
            } catch {
                setError("Please enter a valid image URL.");
                return;
            }
        }

        setSubmitting(true);

        const result = await apiRequest<SaveResponse>(
            isEditing
                ? `/api/studios/manage/${encodeURIComponent(studioId!)}`
                : "/api/studios",
            {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    category: category.name,
                    pricePerHour,
                    securityDeposit,
                    maxCapacity,
                    location,
                    imageUrl,
                    amenities: form.amenities,
                    overview,
                }),
                timeoutMs: 15000,
            }
        );

        setSubmitting(false);

        if (!result.success) {
            setError(
                result.status === 401
                    ? "Your session has expired. Please sign in again."
                    : result.message
            );
            return;
        }

        setSuccess(
            isEditing
                ? "Studio updated successfully!"
                : "Studio published successfully!"
        );

        router.push("/my-listings");
        router.refresh();
    }

    if (isPending) {
        return (
            <LoadingScreen message="Checking your session..." />
        );
    }

    if (!session?.user) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-neutral-50 px-5">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#E60023]">
                        <LockKeyhole size={25} aria-hidden="true" />
                    </div>

                    <h1 className="mt-5 text-2xl font-semibold text-neutral-950">
                        Sign in to manage your studio
                    </h1>

                    <p className="mt-3 text-sm text-neutral-600">
                        You need a Frame account to manage studio
                        listings.
                    </p>

                    <Link
                        href={`/login?redirect=${encodeURIComponent(currentPath)}`}
                        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white hover:bg-[#C9001F]"
                    >
                        Sign In
                        <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                </div>
            </main>
        );
    }

    if (isEditing && (loadingStudio || categoriesLoading)) {
        return (
            <LoadingScreen message="Loading your studio details..." />
        );
    }

    if (isEditing && loadError) {
        return (
            <main className="min-h-[65vh] bg-neutral-50 px-5 py-16">
                <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                    <h1 className="text-xl font-semibold">
                        Unable to edit this studio
                    </h1>
                    <p className="mt-3 text-sm text-neutral-600">
                        {loadError}
                    </p>
                    <Link
                        href="/my-listings"
                        className="mt-6 inline-flex rounded-full bg-[#E60023] px-6 py-3 text-sm font-semibold text-white"
                    >
                        Back to My Listings
                    </Link>
                </div>
            </main>
        );
    }

    if (
        isEditing &&
        (!savedStudio ||
            initializedStudioId !== studioId)
    ) {
        return (
            <LoadingScreen message="Preparing your edit form..." />
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 px-5 py-12 sm:px-8 lg:py-16">
            <div
                className={`mx-auto ${isEditing ? "max-w-3xl" : "max-w-5xl"
                    }`}
            >
                <Link
                    href={returnPath}
                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-[#E60023]"
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    {isEditing ? "Back to My Listings" : "Back to Home"}
                </Link>

                <div className="mt-8">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E60023]">
                        <Building2 size={15} aria-hidden="true" />
                        Host on Frame
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                        {isEditing
                            ? "Edit Studio Workspace"
                            : "Add New Studio"}
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
                        {isEditing
                            ? `Update pricing, capacity, equipment and details for ${savedStudio?.title ||
                            savedStudio?.name ||
                            "your studio"
                            }.`
                            : "Share your creative space with the Frame community. Tell creators what makes your studio special."}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-10 space-y-7"
                >
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-8 border-b border-neutral-100 pb-5">
                            <h2 className="text-xl font-semibold text-neutral-950">
                                Studio Information
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                Studio name, category, pricing and location.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <FieldLabel htmlFor="studio-title">
                                    Studio Title *
                                </FieldLabel>
                                <input
                                    id="studio-title"
                                    className={inputClass}
                                    required
                                    minLength={5}
                                    maxLength={150}
                                    placeholder="e.g. The Creative Loft"
                                    value={form.title}
                                    onChange={(event) =>
                                        updateField("title", event.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="studio-category">
                                    Studio Category *
                                </FieldLabel>
                                <select
                                    id="studio-category"
                                    className={inputClass}
                                    required
                                    value={form.category}
                                    disabled={categoriesLoading}
                                    onChange={(event) =>
                                        updateField("category", event.target.value)
                                    }
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.slug}
                                            value={category.slug}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {usingFallback && (
                                    <p className="mt-2 text-xs text-amber-700">
                                        Showing default categories while the
                                        category service is unavailable.
                                    </p>
                                )}
                            </div>

                            <div>
                                <FieldLabel htmlFor="studio-capacity">
                                    Maximum Capacity *
                                </FieldLabel>
                                <input
                                    id="studio-capacity"
                                    type="number"
                                    min={1}
                                    max={10000}
                                    step={1}
                                    required
                                    className={inputClass}
                                    placeholder="e.g. 12"
                                    value={form.maxCapacity}
                                    onChange={(event) =>
                                        updateField(
                                            "maxCapacity",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="studio-rate">
                                    Hourly Rate ($) *
                                </FieldLabel>
                                <input
                                    id="studio-rate"
                                    type="number"
                                    min="0.01"
                                    max="100000"
                                    step="0.01"
                                    required
                                    className={inputClass}
                                    placeholder="e.g. 75"
                                    value={form.pricePerHour}
                                    onChange={(event) =>
                                        updateField(
                                            "pricePerHour",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="studio-deposit">
                                    Security Deposit ($) *
                                </FieldLabel>
                                <input
                                    id="studio-deposit"
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="0.01"
                                    required
                                    className={inputClass}
                                    value={form.securityDeposit}
                                    onChange={(event) =>
                                        updateField(
                                            "securityDeposit",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <FieldLabel htmlFor="studio-location">
                                    Location / Address *
                                </FieldLabel>
                                <div className="relative">
                                    <MapPin
                                        size={18}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="studio-location"
                                        className={`${inputClass} pl-11`}
                                        required
                                        minLength={5}
                                        maxLength={300}
                                        placeholder="Street address, city, and area"
                                        value={form.location}
                                        onChange={(event) =>
                                            updateField(
                                                "location",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 border-b border-neutral-100 pb-5">
                            <h2 className="text-xl font-semibold text-neutral-950">
                                Studio Image
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                Use an image that accurately represents
                                your studio.
                            </p>
                        </div>

                        <FieldLabel htmlFor="studio-image">
                            Image URL
                        </FieldLabel>
                        <input
                            id="studio-image"
                            type="url"
                            className={inputClass}
                            placeholder="https://example.com/studio.jpg"
                            value={form.imageUrl}
                            onChange={(event) =>
                                updateField("imageUrl", event.target.value)
                            }
                        />

                        <div className="mt-5 flex aspect-[16/7] min-h-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-200 bg-neutral-50">
                            {form.imageUrl.trim() && !imageFailed ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={form.imageUrl.trim()}
                                    alt="Studio image preview"
                                    className="h-full w-full object-cover"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                <div className="px-5 text-center text-neutral-400">
                                    <ImageIcon
                                        size={34}
                                        className="mx-auto"
                                        aria-hidden="true"
                                    />
                                    <p className="mt-3 text-sm">
                                        {imageFailed
                                            ? "Unable to load image preview"
                                            : "Your studio image preview will appear here"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 border-b border-neutral-100 pb-5">
                            <h2 className="text-xl font-semibold text-neutral-950">
                                Amenities & Features
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                Select the facilities available at your studio.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {AMENITY_OPTIONS.map((amenity) => {
                                const selected =
                                    form.amenities.includes(amenity);

                                return (
                                    <label
                                        key={amenity}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${selected
                                            ? "border-red-200 bg-red-50 text-neutral-950"
                                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleAmenity(amenity)}
                                            className="h-4 w-4 accent-[#E60023]"
                                        />
                                        {amenity}
                                    </label>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex gap-2">
                            <input
                                type="text"
                                aria-label="Custom amenity"
                                className={inputClass}
                                placeholder="Add another amenity"
                                maxLength={100}
                                value={customAmenity}
                                onChange={(event) =>
                                    setCustomAmenity(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addCustomAmenity();
                                    }
                                }}
                            />

                            <button
                                type="button"
                                onClick={addCustomAmenity}
                                disabled={
                                    !customAmenity.trim() ||
                                    form.amenities.length >= 50
                                }
                                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                            >
                                <Plus size={17} aria-hidden="true" />
                                Add
                            </button>
                        </div>

                        {form.amenities.some(
                            (amenity) => !AMENITY_OPTIONS.includes(amenity)
                        ) && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {form.amenities
                                        .filter(
                                            (amenity) =>
                                                !AMENITY_OPTIONS.includes(amenity)
                                        )
                                        .map((amenity) => (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity)}
                                                className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-medium text-[#E60023]"
                                            >
                                                {amenity}
                                                <X size={13} aria-hidden="true" />
                                            </button>
                                        ))}
                                </div>
                            )}
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 border-b border-neutral-100 pb-5">
                            <h2 className="text-xl font-semibold text-neutral-950">
                                Detailed Overview
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                Describe your studio, equipment, atmosphere,
                                and supported projects.
                            </p>
                        </div>

                        <FieldLabel htmlFor="studio-overview">
                            Studio Description *
                        </FieldLabel>

                        <textarea
                            id="studio-overview"
                            rows={7}
                            required
                            minLength={20}
                            maxLength={10000}
                            placeholder="Tell creators what makes your space unique..."
                            value={form.overview}
                            onChange={(event) =>
                                updateField("overview", event.target.value)
                            }
                            className={`${inputClass} resize-y py-4`}
                        />

                        <p className="mt-2 text-right text-xs text-neutral-400">
                            {form.overview.length} / 10,000
                        </p>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 border-b border-neutral-100 pb-5">
                            <h2 className="text-xl font-semibold text-neutral-950">
                                Host Information
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                Verified from your Frame account. These
                                details cannot be edited here.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <FieldLabel htmlFor="host-name">
                                    Host Name
                                </FieldLabel>
                                <input
                                    id="host-name"
                                    readOnly
                                    value={session.user.name || ""}
                                    className={`${inputClass} cursor-not-allowed bg-neutral-100 text-neutral-500`}
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="host-email">
                                    Host Email
                                </FieldLabel>
                                <input
                                    id="host-email"
                                    readOnly
                                    value={session.user.email || ""}
                                    className={`${inputClass} cursor-not-allowed bg-neutral-100 text-neutral-500`}
                                />
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
                        >
                            {error}
                            {error.includes("sign in again") && (
                                <Link
                                    href={`/login?redirect=${encodeURIComponent(currentPath)}`}
                                    className="ml-2 font-semibold underline"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
                        >
                            <CheckCircle2 size={18} aria-hidden="true" />
                            {success}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                        <Link
                            href={returnPath}
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-7 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={submitting || categoriesLoading}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E60023] px-8 text-sm font-semibold text-white transition hover:bg-[#C9001F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                    {isEditing ? "Saving..." : "Publishing..."}
                                </>
                            ) : (
                                <>
                                    {isEditing ? "Save Changes" : "Publish Studio"}
                                    <ArrowRight size={17} aria-hidden="true" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
