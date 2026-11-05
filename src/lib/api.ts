
const API_URL = (
    (process.env.NODE_ENV === "production" ? "https://frame-client.vercel.app" : (process.env.NEXT_PUBLIC_API_URL ?? ""))
).replace(/\/+$/, "");

export type ApiResult<T> =
    | {
        success: true;
        data: T;
    }
    | {
        success: false;
        message: string;
        status: number;
    };

type ApiOptions = RequestInit & {
    timeoutMs?: number;
    retries?: number;
};

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// A single shared readiness check prevents concurrent components from
// hammering a sleeping Render instance. Never replay mutations after dispatch.
export const FRAME_CONNECTION_EVENT = "frame:connection";
type ConnectionPhase = "checking" | "waking" | "ready" | "offline";
let readyUntil = 0;
let readinessFlight: Promise<boolean> | null = null;

function reportConnection(phase: ConnectionPhase) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(FRAME_CONNECTION_EVENT, { detail: phase }));
    }
}

export async function waitForFrameServer(): Promise<boolean> {
    if (Date.now() < readyUntil) return true;
    if (readinessFlight) return readinessFlight;

    readinessFlight = (async () => {
        reportConnection("checking");
        const deadline = Date.now() + 90000;
        let first = true;
        while (Date.now() < deadline) {
            try {
                const response = await fetch(`${API_URL}/api/health`, {
                    cache: "no-store",
                    credentials: "include",
                    signal: AbortSignal.timeout(8000),
                });
                if (response.ok) {
                    // The backend returns 200 even while MongoDB is unavailable.
                    // Only proceed when BOTH Express and MongoDB are ready.
                    const health: unknown = await response.json().catch(() => null);
                    if (health && typeof health === "object" &&
                        "database" in health && health.database === "connected") {
                        readyUntil = Date.now() + 15000;
                        reportConnection("ready");
                        return true;
                    }
                }
            } catch { /* Render may still be starting. */ }
            if (first) { reportConnection("waking"); first = false; }
            await wait(3000);
        }
        reportConnection("offline");
        return false;
    })().finally(() => { readinessFlight = null; });
    return readinessFlight;
}

export async function apiRequest<T>(
    path: string,
    options: ApiOptions = {}
): Promise<ApiResult<T>> {
    if (!API_URL) {
        return {
            success: false,
            message: "Frame API is not configured.",
            status: 503,
        };
    }

    const {
        timeoutMs = 15000,
        retries = 0,
        ...requestOptions
    } = options;

    const method = (
        requestOptions.method ?? "GET"
    ).toUpperCase();

    // Never automatically repeat writes.
    const maxRetries =
        method === "GET"
            ? Math.min(Math.max(retries === 0 ? 2 : retries, 0), 3)
            : 0;

    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`
        }`;

    // Check availability before issuing JWTs or performing any write.
    // The health request itself must not recurse into this guard.
    if (path !== "/api/health" && !(await waitForFrameServer())) {
        return {
            success: false,
            message: "Frame services are still starting. Please try again in a moment.",
            status: 503,
        };
    }

    // Obtain an HTTPOnly, short-lived JWT from the backend before mutations.
    // Better Auth session cookie is verified by the server; JS never sees the JWT.
    const needsJwt = ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
        (path === "/api/studios" || path.startsWith("/api/studios/") ||
         path === "/api/bookings" || path.startsWith("/api/bookings/") ||
         path.startsWith("/api/wishlist/") ||
         path.startsWith("/api/reviews/"));

    if (needsJwt) {
        // Issuing a short-lived security cookie is safe to retry on transient
        // connection failures. Never retry the subsequent booking mutation.
        const authDeadline = Date.now() + 90000;
        while (true) {
            try {
                const authResponse = await fetch(`${API_URL}/api/security/issue`, {
                    method: "POST",
                    credentials: "include",
                    signal: AbortSignal.timeout(12000),
                });
                if (authResponse.ok) break;
                const authBody: unknown = await authResponse.json().catch(() => null);
                const message = authBody && typeof authBody === "object" &&
                    "message" in authBody && typeof authBody.message === "string"
                    ? authBody.message : "Please sign in to continue.";
                // Do not hide authentication failures or authorization errors.
                if (authResponse.status < 500 || Date.now() >= authDeadline) {
                    return { success: false, message, status: authResponse.status };
                }
            } catch {
                if (Date.now() >= authDeadline) {
                    reportConnection("offline");
                    return {
                        success: false,
                        message: "Unable to verify your secure session after waiting for Frame services. Please try again.",
                        status: 503,
                    };
                }
            }
            readyUntil = 0;
            reportConnection("waking");
            // Recheck actual database readiness before another JWT attempt.
            if (!(await waitForFrameServer())) {
                return {
                    success: false,
                    message: "Frame services are still unavailable. Please try again later.",
                    status: 503,
                };
            }
            await wait(1500);
        }
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (requestOptions.signal?.aborted) {
                return { success: false, message: "Request cancelled.", status: 499 };
            }
            const response = await fetch(url, {
                ...requestOptions,
                credentials: "include",
                signal: AbortSignal.any([
                    AbortSignal.timeout(timeoutMs),
                    ...(requestOptions.signal
                        ? [requestOptions.signal]
                        : []),
                ]),
            });

            const body: unknown = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                const message =
                    body !== null &&
                        typeof body === "object" &&
                        "message" in body &&
                        typeof body.message === "string"
                        ? body.message
                        : "This service is temporarily unavailable.";

                if (response.status >= 500) readyUntil = 0;

                // Retry only transient server failures.
                if (
                    response.status >= 500 &&
                    attempt < maxRetries
                ) {
                    // A gateway may briefly fail after health becomes ready.
                    readyUntil = 0;
                    if (!(await waitForFrameServer())) break;
                    await wait(600 * (attempt + 1));
                    continue;
                }

                return {
                    success: false,
                    message,
                    status: response.status,
                };
            }

            return {
                success: true,
                data: body as T,
            };
        } catch (error) {
            readyUntil = 0;
            if (requestOptions.signal?.aborted) {
                return {
                    success: false,
                    message: "Request cancelled.",
                    status: 499,
                };
            }

            if (attempt < maxRetries) {
                if (!(await waitForFrameServer())) break;
                await wait(600 * (attempt + 1));
                continue;
            }

            return {
                success: false,
                message:
                    error instanceof Error &&
                        error.name === "TimeoutError"
                        ? "Frame services are taking too long to respond. Please try again."
                        : "Unable to connect to Frame services. Please try again later.",
                status: 503,
            };
        }
    }

    return {
        success: false,
        message: "Frame services are temporarily unavailable.",
        status: 503,
    };
}

export async function getApiHealth(): Promise<{
    success: boolean;
    message: string;
}> {
    const result = await apiRequest<{
        success: boolean;
        message: string;
    }>("/api/health", {
        cache: "no-store",
        timeoutMs: 5000,
        retries: 1,
    });

    if (!result.success) {
        return {
            success: false,
            message: result.message,
        };
    }

    return result.data;
}

/** Download a confirmed booking invoice using the existing authenticated session. */
export async function downloadBookingInvoice(bookingId: string): Promise<ApiResult<true>> {
    if (!API_URL || !/^[a-f\d]{24}$/i.test(bookingId)) {
        return { success: false, message: "Invalid booking reference.", status: 400 };
    }
    try {
        if (!(await waitForFrameServer())) {
            return { success: false, message: "Frame services are still starting. Please try again.", status: 503 };
        }
        const response = await fetch(
            `${API_URL}/api/bookings/${encodeURIComponent(bookingId)}/invoice`,
            { method: "GET", credentials: "include", cache: "no-store", signal: AbortSignal.timeout(20000) }
        );
        if (!response.ok) {
            const body: unknown = await response.json().catch(() => null);
            const message = body && typeof body === "object" && "message" in body &&
                typeof body.message === "string" ? body.message : "Unable to download invoice.";
            return { success: false, message, status: response.status };
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/pdf")) {
            return { success: false, message: "The server did not return a PDF.", status: 502 };
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `frame-invoice-${bookingId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        return { success: true, data: true };
    } catch {
        return { success: false, message: "Could not download the invoice. Please try again.", status: 503 };
    }
}
