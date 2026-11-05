"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, ServerOff } from "lucide-react";
import { FRAME_CONNECTION_EVENT } from "@/lib/api";

type Phase = "checking" | "waking" | "ready" | "offline";

export default function ServerConnectionStatus() {
    const [phase, setPhase] = useState<Phase>("ready");

    useEffect(() => {
        const listener = (event: Event) => {
            const detail = (event as CustomEvent<Phase>).detail;
            if (["checking", "waking", "ready", "offline"].includes(detail)) {
                setPhase(detail);
            }
        };
        window.addEventListener(FRAME_CONNECTION_EVENT, listener);
        return () => window.removeEventListener(FRAME_CONNECTION_EVENT, listener);
    }, []);

    if (phase === "ready") return null;

    const offline = phase === "offline";
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 z-[100] w-[min(92vw,430px)] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        >
            <div className="flex items-start gap-3">
                {offline ? (
                    <ServerOff size={21} className="mt-0.5 shrink-0 text-[#E60023]" />
                ) : (
                    <LoaderCircle size={21} className="mt-0.5 shrink-0 animate-spin text-[#E60023]" />
                )}
                <div>
                    <p className="text-sm font-semibold">
                        {offline ? "Frame server is unavailable" : "Connecting to Frame services…"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                        {offline
                            ? "The connection is taking longer than expected. Please retry your action."
                            : "The server may be waking up. This can take about a minute; please wait."}
                    </p>
                </div>
            </div>
        </div>
    );
}
