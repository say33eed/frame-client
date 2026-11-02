
const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ?? ""
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
};

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

    const { timeoutMs = 8000, ...requestOptions } = options;

    try {
        const response = await fetch(
            `${API_URL}${path.startsWith("/") ? path : `/${path}`}`,
            {
                ...requestOptions,
                credentials: "include",
                signal: AbortSignal.any([
                    AbortSignal.timeout(timeoutMs),
                    ...(requestOptions.signal
                        ? [requestOptions.signal]
                        : []),
                ]),
            }
        );

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
    } catch {
        return {
            success: false,
            message:
                "Unable to connect to Frame services. Please try again later.",
            status: 503,
        };
    }
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
    });

    if (!result.success) {
        return {
            success: false,
            message: result.message,
        };
    }

    return result.data;
}
