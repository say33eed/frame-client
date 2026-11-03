
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, LoaderCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

type BookingModalProps = {
    open: boolean;
    onClose: () => void;
    studioId: string;
    studioTitle: string;
    pricePerHour: number;
    securityDeposit: number;
    maxCapacity: number;
};

type BookingResponse = {
    success: boolean;
    message: string;
    booking?: { _id: string };
};

const money = (value: number) =>
    `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

function localToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function timeMinutes(value: string) {
    if (!/^\d{2}:\d{2}$/.test(value)) return 0;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

export default function BookingModal({
    open,
    onClose,
    studioId,
    studioTitle,
    pricePerHour,
    securityDeposit,
    maxCapacity,
}: BookingModalProps) {
    const router = useRouter();
    const submittingRef = useRef(false);

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [crewCount, setCrewCount] = useState("1");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const duration = timeMinutes(endTime) - timeMinutes(startTime);
    const hours = startTime && endTime && duration > 0
        ? duration / 60
        : 0;

    const subtotal = Math.round(pricePerHour * hours * 100) / 100;
    const total = Math.round((subtotal + securityDeposit) * 100) / 100;

    const validCrew =
        Number.isInteger(Number(crewCount)) &&
        Number(crewCount) >= 1 &&
        Number(crewCount) <= maxCapacity;

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submittingRef.current) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    function closeModal() {
        if (!submittingRef.current) onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submittingRef.current) return;

        if (!date || !startTime || !endTime || hours <= 0) {
            toast.error("Please choose a valid booking date and time.");
            return;
        }

        if (!validCrew) {
            toast.error(`Crew count must be between 1 and ${maxCapacity}.`);
            return;
        }

        if (notes.length > 2000) {
            toast.error("Production notes cannot exceed 2,000 characters.");
            return;
        }

        // This matches the backend's current date/time validation.
        const requestedStart = new Date(`${date}T${startTime}:00Z`);
        if (requestedStart.getTime() <= Date.now()) {
            toast.error("Please choose a future booking date and time.");
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);

        try {
            const result = await apiRequest<BookingResponse>(
                "/api/bookings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        studioId,
                        date,
                        startTime,
                        endTime,
                        crewCount: Number(crewCount),
                        notes: notes.trim(),
                    }),
                    timeoutMs: 15000,
                }
            );

            if (!result.success) {
                if (result.status === 401) {
                    toast.error("Please sign in to request a booking.");
                    router.push(
                        `/login?redirect=${encodeURIComponent(
                            `/studios/${studioId}`
                        )}`
                    );
                    return;
                }

                toast.error(result.message);
                return;
            }

            if (!result.data?.success) {
                toast.error(
                    result.data?.message ||
                    "Unable to submit your booking."
                );
                return;
            }

            toast.success("Booking request submitted successfully!");

            setDate("");
            setStartTime("");
            setEndTime("");
            setCrewCount("1");
            setNotes("");

            onClose();
        } catch {
            toast.error("Unable to submit your booking. Please try again.");
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }

    const fieldClass =
        "mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/70 px-4 py-6 backdrop-blur-[3px]"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-modal-title"
                className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                            Reserve Creative Slot
                        </p>

                        <h2
                            id="booking-modal-title"
                            className="mt-1 text-xl font-bold leading-tight text-neutral-950"
                        >
                            {studioTitle}
                        </h2>

                        <p className="mt-2 text-xs text-neutral-500">
                            Rate: {money(pricePerHour)}/hr · Deposit:{" "}
                            {money(securityDeposit)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={submitting}
                        aria-label="Close booking modal"
                        className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block text-xs font-semibold text-neutral-700">
                        Shoot Date
                        <span className="relative block">
                            <input
                                type="date"
                                required
                                min={localToday()}
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                className={fieldClass}
                            />
                            <CalendarDays
                                size={16}
                                className="pointer-events-none absolute right-10 top-5 text-neutral-400"
                            />
                        </span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-xs font-semibold text-neutral-700">
                            Start Time
                            <span className="relative block">
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={(event) =>
                                        setStartTime(event.target.value)
                                    }
                                    className={fieldClass}
                                />
                                <Clock3
                                    size={14}
                                    className="pointer-events-none absolute right-9 top-5 text-neutral-400"
                                />
                            </span>
                        </label>

                        <label className="block text-xs font-semibold text-neutral-700">
                            End Time
                            <input
                                type="time"
                                required
                                value={endTime}
                                onChange={(event) =>
                                    setEndTime(event.target.value)
                                }
                                className={fieldClass}
                            />
                        </label>
                    </div>

                    {startTime && endTime && hours === 0 && (
                        <p className="text-xs text-[#E60023]">
                            End time must be after start time.
                        </p>
                    )}

                    <label className="block text-xs font-semibold text-neutral-700">
                        Expected Crew / Talent Count (Max {maxCapacity})
                        <input
                            type="number"
                            required
                            min={1}
                            max={maxCapacity}
                            step={1}
                            value={crewCount}
                            onChange={(event) =>
                                setCrewCount(event.target.value)
                            }
                            className={fieldClass}
                        />
                    </label>

                    <label className="block text-xs font-semibold text-neutral-700">
                        Production Requirements / Gear Notes{" "}
                        <span className="font-normal text-neutral-400">
                            (Optional)
                        </span>
                        <textarea
                            rows={2}
                            maxLength={2000}
                            value={notes}
                            onChange={(event) =>
                                setNotes(event.target.value)
                            }
                            placeholder="e.g. Bringing additional lighting, special equipment..."
                            className={`${fieldClass} min-h-20 resize-y py-3`}
                        />
                    </label>

                    <div className="rounded-2xl bg-neutral-100 p-4 text-xs">
                        <div className="flex justify-between gap-3 py-1">
                            <span className="text-neutral-500">
                                {money(pricePerHour)} × {hours || 0} shoot hours
                            </span>
                            <span className="font-medium text-neutral-700">
                                {money(subtotal)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-3 py-1">
                            <span className="text-neutral-500">
                                Refundable Security Deposit
                            </span>
                            <span className="font-medium text-neutral-700">
                                {money(securityDeposit)}
                            </span>
                        </div>

                        <div className="mt-2 flex justify-between gap-3 border-t border-neutral-200 pt-3 text-sm font-bold">
                            <span>Total Estimated Cost</span>
                            <span className="text-amber-600">
                                {hours > 0 ? money(total) : "—"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !hours || !validCrew}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-neutral-950 shadow-md transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Sending Booking Request...
                            </>
                        ) : (
                            <>
                                <Sparkles size={17} />
                                Confirm & Send Booking Request
                            </>
                        )}
                    </button>

                    <p className="text-center text-[11px] text-neutral-500">
                        Requests are submitted as Pending until reviewed.
                    </p>
                </form>
            </div>
        </div>
    );
}
