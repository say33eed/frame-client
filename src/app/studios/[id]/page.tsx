"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, ArrowRight, CalendarDays, Camera, Check, ChevronLeft,
    ChevronRight, Clock3, MapPin, ShieldCheck, Star, X,
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
    securityDeposit?: number;
    maxCapacity?: number;
    imageUrl?: string;
    images?: string[];
    gallery?: string[];
    amenities?: string[];
    overview?: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    reviews?: Array<{ _id?: string; name?: string; userName?: string; rating?: number; comment?: string; text?: string }>;
    hostName?: string;
    hostEmail?: string;
    userName?: string;
    userEmail?: string;
    host?: { name?: string; email?: string };
};

type StudioResponse = { success: boolean; studio: Studio };

const money = (amount: number) => `$${amount.toLocaleString("en-US")}`;
const titleOf = (studio: Studio) => studio.title || studio.name || "Untitled studio";
const rateOf = (studio: Studio) => Number(studio.hourlyRate ?? studio.pricePerHour ?? 0);

function StudioImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
    if (!src) {
        return <div className={`${className} flex flex-col items-center justify-center gap-3 bg-neutral-100 text-neutral-400`}><Camera size={36} /><span className="text-sm">Studio photo unavailable</span></div>;
    }
    // External image URLs are provided by studio hosts.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
}

export default function StudioDetailsPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const [studio, setStudio] = useState<Studio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImage, setActiveImage] = useState(0);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const loadStudio = useCallback(async () => {
        setLoading(true);
        setError("");
        const result = await apiRequest<StudioResponse>(`/api/studios/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (result.success && result.data?.studio) {
            setStudio(result.data.studio);
        } else {
            setStudio(null);
            setError(result.success ? "Studio information is unavailable." : result.message);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        // Schedule the request outside the synchronous effect body.
        // This satisfies react-hooks/set-state-in-effect while retaining retry behavior.
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) void loadStudio();
        });
        return () => controller.abort();
    }, [loadStudio]);

    useEffect(() => {
        if (!bookingOpen) return;
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setBookingOpen(false);
        };
        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, [bookingOpen]);

    if (loading) {
        return <main className="mx-auto max-w-7xl animate-pulse px-5 py-12 sm:px-8"><div className="mb-7 h-9 w-2/3 rounded bg-neutral-200" /><div className="aspect-[16/7] rounded-3xl bg-neutral-200" /><div className="mt-10 grid gap-8 lg:grid-cols-3"><div className="h-80 rounded-2xl bg-neutral-100 lg:col-span-2" /><div className="h-80 rounded-2xl bg-neutral-100" /></div></main>;
    }

    if (!studio) {
        return <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 text-center"><Camera className="mb-5 text-neutral-400" size={40} /><h1 className="text-3xl font-semibold text-neutral-950">Studio unavailable</h1><p className="mt-3 text-neutral-600">{error || "We couldn't find this workspace."}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/studios" className="rounded-full bg-[#E60023] px-6 py-3 text-sm font-semibold text-white">Explore Studios</Link><button type="button" onClick={() => void loadStudio()} className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900">Try Again</button></div></main>;
    }

    const images = [...new Set([...(studio.images || []), ...(studio.gallery || []), studio.imageUrl || ""].filter(Boolean))];
    const imageIndex = Math.min(activeImage, Math.max(images.length - 1, 0));
    const amenities = Array.isArray(studio.amenities) ? studio.amenities : [];
    const reviews = Array.isArray(studio.reviews) ? studio.reviews : [];
    const hostName = studio.host?.name || studio.hostName || studio.userName || "Host information unavailable";
    const hostEmail = studio.host?.email || studio.hostEmail || studio.userEmail;
    const price = rateOf(studio);
    const deposit = Number(studio.securityDeposit ?? 0);
    const startHour = startTime ? Number(startTime.split(":")[0]) + Number(startTime.split(":")[1]) / 60 : 0;
    const endHour = endTime ? Number(endTime.split(":")[0]) + Number(endTime.split(":")[1]) / 60 : 0;
    const hours = startTime && endTime && endHour > startHour ? endHour - startHour : 0;

    return <main className="bg-neutral-50 pb-24 text-neutral-950">
        <div className="mx-auto max-w-7xl px-5 pt-9 sm:px-8 lg:pt-12">
            <Link href="/studios" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#E60023]"><ArrowLeft size={16} /> Back to Explore Studios</Link>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
                <div><div className="mb-3 flex flex-wrap items-center gap-3"><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#E60023]">{studio.category || "Creative Space"}</span><span className="inline-flex items-center gap-1.5 text-sm text-neutral-500"><MapPin size={15} />{studio.location || studio.address || "Location not specified"}</span></div><h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">{titleOf(studio)}</h1></div>
                <button type="button" onClick={() => { if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(window.location.href); }} className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[#E60023] hover:text-[#E60023]">Copy page link</button>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-neutral-200">
                <StudioImage src={images[imageIndex]} alt={`${titleOf(studio)} photo ${imageIndex + 1}`} className="aspect-[16/8] w-full object-cover sm:aspect-[16/7]" />
                {images.length > 1 && <><button type="button" aria-label="Previous image" onClick={() => setActiveImage((imageIndex - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-neutral-950 shadow"><ChevronLeft /></button><button type="button" aria-label="Next image" onClick={() => setActiveImage((imageIndex + 1) % images.length)} className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-neutral-950 shadow"><ChevronRight /></button></>}
                {images.length > 0 && <span className="absolute bottom-4 right-4 rounded-full bg-neutral-950/85 px-3 py-1.5 text-xs font-semibold text-white">Photo {imageIndex + 1} of {images.length}</span>}
            </div>
            {images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={imageIndex === index} className={`shrink-0 overflow-hidden rounded-xl border-2 ${imageIndex === index ? "border-[#E60023]" : "border-transparent"}`}><StudioImage src={image} alt={`Thumbnail ${index + 1}`} className="h-16 w-24 object-cover" /></button>)}</div>}
            <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:grid-cols-4">
                        <div><p className="text-xs text-neutral-500">Hourly Rate</p><p className="mt-1 font-bold text-[#E60023]">{money(price)}/hr</p></div>
                        <div><p className="text-xs text-neutral-500">Security Deposit</p><p className="mt-1 font-semibold">{money(deposit)}</p></div>
                        <div><p className="text-xs text-neutral-500">Max Capacity</p><p className="mt-1 font-semibold">{studio.maxCapacity ? `${studio.maxCapacity} people` : "Not specified"}</p></div>
                        <div><p className="text-xs text-neutral-500">Client Rating</p><p className="mt-1 flex items-center gap-1 font-semibold">{typeof studio.rating === "number" ? <><Star size={16} className="fill-[#E60023] text-[#E60023]" />{studio.rating.toFixed(1)}</> : "Not yet rated"}</p></div>
                    </div>
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"><h2 className="text-xl font-semibold">Workspace Overview</h2><p className="mt-4 whitespace-pre-line leading-7 text-neutral-600">{studio.overview || studio.description || "The host hasn't added a workspace overview yet."}</p></section>
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"><h2 className="text-xl font-semibold">Equipment &amp; Amenities</h2>{amenities.length ? <ul className="mt-5 grid gap-4 sm:grid-cols-2">{amenities.map((amenity) => <li key={amenity} className="flex items-start gap-2.5 text-sm text-neutral-700"><Check size={18} className="shrink-0 text-[#E60023]" />{amenity}</li>)}</ul> : <p className="mt-4 text-sm text-neutral-500">No amenities have been listed yet.</p>}</section>
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"><h2 className="text-xl font-semibold">Meet Your Host</h2><div className="mt-5 flex items-center gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-700">{hostName.charAt(0).toUpperCase()}</div><div><p className="font-semibold">{hostName}</p>{hostEmail && <p className="break-all text-sm text-neutral-500">{hostEmail}</p>}</div></div></section>
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"><h2 className="text-xl font-semibold">Creator Reviews {reviews.length > 0 ? `(${reviews.length})` : ""}</h2>{reviews.length ? <div className="mt-5 space-y-5">{reviews.map((review, index) => <div key={review._id || index} className="border-t border-neutral-100 pt-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{review.name || review.userName || "Frame creator"}</p>{typeof review.rating === "number" && <span className="inline-flex items-center gap-1 text-sm"><Star size={14} className="fill-[#E60023] text-[#E60023]" />{review.rating.toFixed(1)}</span>}</div><p className="mt-2 text-sm leading-6 text-neutral-600">{review.comment || review.text || "No written review."}</p></div>)}</div> : <p className="mt-4 text-sm text-neutral-500">No reviews yet. Reviews will appear when creators share their experiences.</p>}</section>
                </div>
                <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-24"><div className="flex items-center justify-between gap-3"><p><span className="text-3xl font-bold text-[#E60023]">{money(price)}</span><span className="text-sm text-neutral-500"> / hour</span></p>{typeof studio.rating === "number" && <span className="inline-flex items-center gap-1 text-sm font-semibold"><Star size={15} className="fill-[#E60023] text-[#E60023]" />{studio.rating.toFixed(1)}</span>}</div><div className="mt-6 space-y-4 border-t border-neutral-100 pt-5 text-sm"><div className="flex justify-between gap-3"><span className="text-neutral-500">Security deposit</span><strong>{money(deposit)}</strong></div><div className="flex justify-between gap-3"><span className="text-neutral-500">Booking status</span><span className="font-medium">Request required</span></div></div><button type="button" onClick={() => setBookingOpen(true)} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E60023] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"><CalendarDays size={17} /> Book Workspace Now <ArrowRight size={16} /></button><p className="mt-4 text-center text-xs leading-5 text-neutral-500">Select your preferred date and hours. Booking requests will become available when reservations are enabled.</p><div className="mt-5 flex items-center justify-center gap-2 border-t border-neutral-100 pt-5 text-xs text-neutral-500"><ShieldCheck size={16} /> Transparent hourly pricing</div></aside>
            </div>
        </div>
        {bookingOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/65 px-4 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E60023]">Frame reservations</p><h2 id="booking-title" className="mt-2 text-2xl font-semibold">Choose Your Shoot Hours</h2><p className="mt-2 text-sm text-neutral-500">{titleOf(studio)}</p></div><button type="button" onClick={() => setBookingOpen(false)} aria-label="Close booking dialog" className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"><X size={21} /></button></div><div className="mt-7 space-y-5"><label className="block text-sm font-semibold">Booking date<input type="date" value={bookingDate} min={new Date().toLocaleDateString("en-CA")} onChange={(event) => setBookingDate(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 font-normal outline-none focus:border-[#E60023]" /></label><div className="grid grid-cols-2 gap-4"><label className="block text-sm font-semibold">Start time<span className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3"><Clock3 size={16} className="text-neutral-400" /><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-12 min-w-0 w-full bg-transparent font-normal outline-none" /></span></label><label className="block text-sm font-semibold">End time<span className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3"><Clock3 size={16} className="text-neutral-400" /><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-12 min-w-0 w-full bg-transparent font-normal outline-none" /></span></label></div>{startTime && endTime && hours === 0 && <p className="text-sm text-[#E60023]">End time must be after start time.</p>}<div className="rounded-2xl bg-neutral-50 p-5 text-sm"><div className="flex justify-between"><span className="text-neutral-500">Studio rate</span><span className="font-semibold">{money(price)}/hr</span></div><div className="mt-3 flex justify-between"><span className="text-neutral-500">Duration</span><span className="font-semibold">{hours || "—"} {hours === 1 ? "hour" : "hours"}</span></div><div className="mt-3 flex justify-between"><span className="text-neutral-500">Security deposit</span><span className="font-semibold">{money(deposit)}</span></div><div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-bold"><span>Estimated total</span><span>{hours ? money(price * hours + deposit) : "—"}</span></div></div><div role="status" className="rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600">Booking requests are not enabled yet. Your selected hours have <strong>not</strong> been submitted or reserved.</div><button type="button" disabled className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-neutral-200 px-5 font-semibold text-neutral-500">Booking submission coming soon</button></div></div></div>}
    </main>;
}
