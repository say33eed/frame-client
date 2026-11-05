"use client";

import { bookingCompleted } from "@/lib/booking-time";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clock3, LoaderCircle, RefreshCw, X, AlertTriangle } from "lucide-react";
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
    const [confirmation, setConfirmation] = useState<{ booking: HostBooking; decision: "confirm" | "cancel" } | null>(null);
    const modalCancelRef = useRef<HTMLButtonElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
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

    const askDecision = (booking: HostBooking, decision: "confirm" | "cancel") => {
        if (inFlight.current || busyId !== null || loading || booking.status !== "Pending") return;
        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setConfirmation({ booking, decision });
    };

    const closeConfirmation = () => {
        if (inFlight.current) return;
        setConfirmation(null);
        window.setTimeout(() => previousFocusRef.current?.focus(), 0);
    };

    useEffect(() => {
        if (!confirmation) return;
        const oldOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modalCancelRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !inFlight.current) {
                event.preventDefault();
                setConfirmation(null);
                window.setTimeout(() => previousFocusRef.current?.focus(), 0);
            }
            if (event.key === "Tab") {
                const dialog = document.getElementById("frame-host-decision-dialog");
                if (!dialog) return;
                const focusables = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
                if (!focusables.length) { event.preventDefault(); return; }
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = oldOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [confirmation]);

    const decide = async () => {
        if (!confirmation || inFlight.current || confirmation.booking.status !== "Pending") return;
        const { booking, decision } = confirmation;
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
        setConfirmation(null);
        window.setTimeout(() => previousFocusRef.current?.focus(), 0);
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
                        <button type="button" onClick={() => askDecision(booking, "confirm")} disabled={busyId !== null || loading}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E60023] px-5 text-sm font-semibold text-white hover:bg-[#C9001F] disabled:opacity-50">
                            {busyId === booking._id ? <LoaderCircle size={16} className="animate-spin"/> : <Check size={16}/>} Confirm
                        </button>
                        <button type="button" onClick={() => askDecision(booking, "cancel")} disabled={busyId !== null || loading}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-300 px-5 text-sm font-semibold hover:border-[#E60023] disabled:opacity-50 dark:border-white/20">
                            <X size={16}/> Decline
                        </button>
                    </div>
                </article>)}
            </div>}
            {!loading && processed.length > 0 && <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={16}/> Recent decisions</h3>
                <div className="mt-3 space-y-2">{processed.map(booking => <div key={booking._id} className="flex flex-wrap justify-between gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <span>{booking.studioTitle || "Studio"} · {displayDate(booking.date)}</span><span className="font-semibold">{bookingCompleted(booking) ? "Completed" : booking.status}</span>
                </div>)}</div>
            </div>}
            {confirmation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) closeConfirmation(); }}>
                    <div id="frame-host-decision-dialog" role="alertdialog" aria-modal="true" aria-labelledby="frame-decision-title" aria-describedby="frame-decision-description" className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-950 shadow-2xl dark:border-white/15 dark:bg-[#1C1C1C] dark:text-white sm:p-7">
                        <div className="flex items-start justify-between gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${confirmation.decision === "confirm" ? "bg-red-50 text-[#E60023] dark:bg-red-500/15" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"}`}>
                                {confirmation.decision === "confirm" ? <Check size={24} /> : <AlertTriangle size={24} />}
                            </div>
                            <button ref={modalCancelRef} type="button" aria-label="Close confirmation" onClick={closeConfirmation} disabled={busyId !== null} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:opacity-50 dark:hover:bg-white/10"><X size={20}/></button>
                        </div>
                        <h3 id="frame-decision-title" className="mt-5 text-xl font-bold">{confirmation.decision === "confirm" ? "Confirm booking request?" : "Decline booking request?"}</h3>
                        <p id="frame-decision-description" className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {confirmation.decision === "confirm" ? "This will confirm the guest's reservation and update its status in Frame." : "This will decline the guest's request and update its status to Cancelled."}
                        </p>
                        <div className="mt-5 space-y-1 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-white/10 dark:bg-[#151515]">
                            <p className="font-semibold">{confirmation.booking.studioTitle || "Studio"}</p>
                            <p className="text-neutral-600 dark:text-neutral-300">{displayDate(confirmation.booking.date)} · {confirmation.booking.startTime}–{confirmation.booking.endTime}</p>
                            <p className="break-all text-neutral-500 dark:text-neutral-400">{confirmation.booking.userEmail || "Frame member"}</p>
                        </div>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={closeConfirmation} disabled={busyId !== null} className="inline-flex min-h-12 justify-center items-center rounded-full border border-neutral-300 px-6 text-sm font-semibold hover:border-[#E60023] disabled:opacity-50 dark:border-white/20 dark:hover:border-[#E60023]">Keep pending</button>
                            <button type="button" onClick={() => void decide()} disabled={busyId !== null} className={`inline-flex min-h-12 justify-center items-center gap-2 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60 ${confirmation.decision === "confirm" ? "bg-[#E60023] hover:bg-[#C9001F]" : "bg-neutral-800 hover:bg-neutral-950 dark:bg-red-700 dark:hover:bg-red-600"}`}>
                                {busyId !== null ? <LoaderCircle size={17} className="animate-spin"/> : confirmation.decision === "confirm" ? <Check size={17}/> : <X size={17}/>}
                                {busyId !== null ? "Updating booking…" : confirmation.decision === "confirm" ? "Yes, confirm booking" : "Yes, decline request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
