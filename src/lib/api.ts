
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
            ? Math.min(Math.max(retries, 0), 2)
            : 0;

    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`
        }`;

    // Obtain an HTTPOnly, short-lived JWT from the backend before mutations.
    // Better Auth session cookie is verified by the server; JS never sees the JWT.
    const needsJwt = ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
        (path === "/api/studios" || path.startsWith("/api/studios/") ||
         path === "/api/bookings" || path.startsWith("/api/bookings/") ||
         path.startsWith("/api/wishlist/"));

    if (needsJwt) {
        try {
            const authResponse = await fetch(`${API_URL}/api/security/issue`, {
                method: "POST",
                credentials: "include",
                signal: AbortSignal.timeout(timeoutMs),
            });
            if (!authResponse.ok) {
                const authBody: unknown = await authResponse.json().catch(() => null);
                const message = authBody && typeof authBody === "object" &&
                    "message" in authBody && typeof authBody.message === "string"
                    ? authBody.message : "Please sign in to continue.";
                return { success: false, message, status: authResponse.status };
            }
        } catch {
            return {
                success: false,
                message: "Unable to verify your secure session. Please try again.",
                status: 503,
            };
        }
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
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

                // Retry only transient server failures.
                if (
                    response.status >= 500 &&
                    attempt < maxRetries
                ) {
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
            if (requestOptions.signal?.aborted) {
                return {
                    success: false,
                    message: "Request cancelled.",
                    status: 499,
                };
            }

            if (attempt < maxRetries) {
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
