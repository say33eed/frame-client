
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    CalendarDays,
    LoaderCircle,
    X,
} from "lucide-react";
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
    booking?: {
        _id: string;
    };
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

    const duration =
        timeMinutes(endTime) - timeMinutes(startTime);

    const hours =
        startTime && endTime && duration > 0
            ? duration / 60
            : 0;

    const subtotal =
        Math.round(pricePerHour * hours * 100) / 100;

    const total =
        Math.round((subtotal + securityDeposit) * 100) / 100;

    const validCrew =
        crewCount.trim() !== "" &&
        Number.isInteger(Number(crewCount)) &&
        Number(crewCount) >= 1 &&
        Number(crewCount) <= maxCapacity;

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (
                event.key === "Escape" &&
                !submittingRef.current
            ) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [open, onClose]);

    if (!open) return null;

    function closeModal() {
        if (!submittingRef.current) {
            onClose();
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (submittingRef.current) return;

        if (
            !date ||
            !startTime ||
            !endTime ||
            hours <= 0
        ) {
            toast.error(
                "Please choose a valid booking date and time."
            );
            return;
        }

        if (!validCrew) {
            toast.error(
                `Crew count must be between 1 and ${maxCapacity}.`
            );
            return;
        }

        if (notes.length > 2000) {
            toast.error(
                "Production notes cannot exceed 2,000 characters."
            );
            return;
        }

        // Matches the current backend UTC validation.
        const requestedStart = new Date(
            `${date}T${startTime}:00Z`
        );

        if (requestedStart.getTime() <= Date.now()) {
            toast.error(
                "Please choose a future booking date and time."
            );
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);

        try {
            const result =
                await apiRequest<BookingResponse>(
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
                    toast.error(
                        "Please sign in to request a booking."
                    );

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

            toast.success(
                "Booking request submitted successfully!"
            );

            setDate("");
            setStartTime("");
            setEndTime("");
            setCrewCount("1");
            setNotes("");

            onClose();
        } catch {
            toast.error(
                "Unable to submit your booking. Please try again."
            );
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }

    const fieldClass =
        "mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-normal text-neutral-950 outline-none transition-colors focus:border-[#E60023]  ";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/65 px-4 py-6 backdrop-blur-[3px]"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget
                ) {
                    closeModal();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-modal-title"
                className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E60023]">
                            Frame Reservations
                        </p>

                        <h2
                            id="booking-modal-title"
                            className="mt-2 text-2xl font-semibold text-neutral-950"
                        >
                            Reserve Your Workspace
                        </h2>

                        <p className="mt-2 text-sm font-medium text-neutral-700">
                            {studioTitle}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                            {money(pricePerHour)}/hr ·{" "}
                            {money(securityDeposit)} security deposit
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={submitting}
                        aria-label="Close booking modal"
                        className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-5"
                >
                    <label className="block text-sm font-semibold text-neutral-900">
                        Booking Date

                        <input
                            type="date"
                            required
                            min={localToday()}
                            value={date}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                            className={fieldClass}
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block text-sm font-semibold text-neutral-900">
                            Start Time

                            <input
                                type="time"
                                required
                                value={startTime}
                                onChange={(event) =>
                                    setStartTime(
                                        event.target.value
                                    )
                                }
                                className={fieldClass}
                            />
                        </label>

                        <label className="block text-sm font-semibold text-neutral-900">
                            End Time

                            <input
                                type="time"
                                required
                                value={endTime}
                                onChange={(event) =>
                                    setEndTime(
                                        event.target.value
                                    )
                                }
                                className={fieldClass}
                            />
                        </label>
                    </div>

                    {startTime &&
                        endTime &&
                        hours === 0 && (
                            <p className="text-sm text-[#E60023]">
                                End time must be after start time.
                            </p>
                        )}

                    <label className="block text-sm font-semibold text-neutral-900">
                        Expected Crew / Talent Count
                        <span className="ml-1 font-normal text-neutral-500">
                            (Max {maxCapacity})
                        </span>

                        <input
                            type="number"
                            required
                            min={1}
                            max={maxCapacity}
                            step={1}
                            value={crewCount}
                            onChange={(event) =>
                                setCrewCount(
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        />
                    </label>

                    <label className="block text-sm font-semibold text-neutral-900">
                        Production Requirements / Gear Notes
                        <span className="ml-1 font-normal text-neutral-400">
                            (Optional)
                        </span>

                        <textarea
                            rows={3}
                            maxLength={2000}
                            value={notes}
                            onChange={(event) =>
                                setNotes(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Additional lighting, camera equipment, or special setup requirements..."
                            className={`${fieldClass} min-h-24 resize-y py-3`}
                        />
                    </label>

                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-neutral-500">
                                Studio rate
                            </span>

                            <span className="font-semibold text-neutral-950">
                                {money(pricePerHour)}/hr
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-3">
                            <span className="text-neutral-500">
                                Duration
                            </span>

                            <span className="font-semibold text-neutral-950">
                                {hours > 0
                                    ? `${hours} ${hours === 1
                                        ? "hour"
                                        : "hours"
                                    }`
                                    : "—"}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-3">
                            <span className="text-neutral-500">
                                Studio subtotal
                            </span>

                            <span className="font-semibold text-neutral-950">
                                {money(subtotal)}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-3">
                            <span className="text-neutral-500">
                                Refundable security deposit
                            </span>

                            <span className="font-semibold text-neutral-950">
                                {money(securityDeposit)}
                            </span>
                        </div>

                        <div className="mt-4 flex justify-between gap-3 border-t border-neutral-200 pt-4 text-base font-bold">
                            <span className="text-neutral-950">
                                Estimated total
                            </span>

                            <span className="text-[#E60023]">
                                {hours > 0
                                    ? money(total)
                                    : "—"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !hours ||
                            !validCrew
                        }
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E60023] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                />
                                Connecting / Sending Booking Request...
                            </>
                        ) : (
                            <>
                                <CalendarDays size={17} />
                                Confirm & Send Booking Request
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs leading-5 text-neutral-500">
                        Booking requests are submitted as{" "}
                        <span className="font-semibold text-neutral-700">
                            Pending
                        </span>{" "}
                        until reviewed.
                    </p>
                </form>
            </div>
        </div>
    );
}
