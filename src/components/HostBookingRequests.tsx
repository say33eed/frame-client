"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clock3, LoaderCircle, RefreshCw, X } from "lucide-react";
import { apiRequest } from "@/lib/api";

type HostBooking = {
    _id: string;
    studioTitle?: string;
    date: string;
    startTime: string;
    endTime: string;
    crewCount?: number;
    total?: number;
    userEmail?: string;
    notes?: string;
    status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
};
type InboxResponse = { success: boolean; bookings: HostBooking[]; count: number };
type DecisionResponse = { success: boolean; message: string; booking: { _id: string; status: string } };

function displayDate(date: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) return date;
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
        timeZone: "UTC", month: "short", day: "numeric", year: "numeric",
    });
}

export default function HostBookingRequests({ userId }: { userId: string }) {
    const [bookings, setBookings] = useState<HostBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [actionError, setActionError] = useState("");
    const inFlight = useRef(false);
    const load = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const result = await apiRequest<InboxResponse>("/api/bookings/host", {
            cache: "no-store", timeoutMs: 15000, retries: 2,
        });
        if (result.success) {
            setBookings(Array.isArray(result.data.bookings) ? result.data.bookings : []);
            setError("");
        } else {
            setError(result.message);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const id = window.setTimeout(() => { void load(); }, 0);
        return () => window.clearTimeout(id);
    }, [load, userId]);

    const decide = async (booking: HostBooking, decision: "confirm" | "cancel") => {
        if (inFlight.current || booking.status !== "Pending") return;
        const verb = decision === "confirm" ? "confirm" : "decline";
        if (!window.confirm(`Are you sure you want to ${verb} the booking for ${booking.studioTitle || "this studio"} on ${displayDate(booking.date)}?`)) return;
        inFlight.current = true;
        setBusyId(booking._id);
        setError("");
        setNotice("");
        setActionError("");
        const result = await apiRequest<DecisionResponse>(
            `/api/bookings/${encodeURIComponent(booking._id)}/host-decision`,
            { method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision }), timeoutMs: 20000 },
        );
        if (result.success) {
            setNotice(result.data.message);
        } else {
            setActionError(`${result.message} Refresh requests to verify the latest booking status before trying again.`);
        }
        // Read the authoritative DB state even when the mutation response was lost.
        await load();
        setBusyId(null);
        inFlight.current = false;
    };

    const pending = bookings.filter(booking => booking.status === "Pending");
    const processed = bookings.filter(booking => booking.status !== "Pending").slice(0, 5);
    return (
        <section aria-label="Incoming studio booking requests" className="mt-9 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#E60023]">For studio hosts</p>
                    <h2 className="text-xl font-bold">Incoming booking requests</h2>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Review requests for studios you own. Confirm or decline pending reservations.</p>
                </div>
                <button type="button" onClick={() => void load()} disabled={loading || busyId !== null}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:border-[#E60023] disabled:opacity-50 dark:border-white/20">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""}/> Refresh requests
                </button>
            </div>
            {actionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">{actionError}</p>}
            {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</p>}
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
            {loading && <p role="status" className="py-10 text-center text-sm text-neutral-500">Loading incoming requests…</p>}
            {!loading && !error && pending.length === 0 && <p className="py-8 text-sm text-neutral-500 dark:text-neutral-400">No pending requests for your studios.</p>}
            {!loading && pending.length > 0 && <div className="mt-5 divide-y divide-neutral-200 dark:divide-white/10">
                {pending.map(booking => <article key={booking._id} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-1">
                        <p className="font-semibold">{booking.studioTitle || "Studio"}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">{displayDate(booking.date)} · {booking.startTime}–{booking.endTime} · {booking.crewCount ?? "—"} crew</p>
                        <p className="break-all text-sm text-neutral-500 dark:text-neutral-400">Requested by: {booking.userEmail || "Frame member"}</p>
                        {booking.notes && <p className="max-w-2xl whitespace-pre-wrap break-words text-sm text-neutral-500 dark:text-neutral-400">Notes: {booking.notes}</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <button type="button" onClick={() => void decide(booking, "confirm")} disabled={busyId !== null || loading}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E60023] px-5 text-sm font-semibold text-white hover:bg-[#C9001F] disabled:opacity-50">
                            {busyId === booking._id ? <LoaderCircle size={16} className="animate-spin"/> : <Check size={16}/>} Confirm
                        </button>
                        <button type="button" onClick={() => void decide(booking, "cancel")} disabled={busyId !== null || loading}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-300 px-5 text-sm font-semibold hover:border-[#E60023] disabled:opacity-50 dark:border-white/20">
                            <X size={16}/> Decline
                        </button>
                    </div>
                </article>)}
            </div>}
            {!loading && processed.length > 0 && <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={16}/> Recent decisions</h3>
                <div className="mt-3 space-y-2">{processed.map(booking => <div key={booking._id} className="flex flex-wrap justify-between gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <span>{booking.studioTitle || "Studio"} · {displayDate(booking.date)}</span><span className="font-semibold">{booking.status}</span>
                </div>)}</div>
            </div>}
        </section>
    );
}
