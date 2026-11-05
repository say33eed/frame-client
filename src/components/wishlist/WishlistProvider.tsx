
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type WishlistContextValue = {
    savedIds: Set<string>;
    loading: boolean;
    busyIds: Set<string>;
    toggle: (
        id: string
    ) => Promise<{ success: boolean; message?: string }>;
    refresh: () => Promise<void>;
    signedIn: boolean;
};

const WishlistContext =
    createContext<WishlistContextValue | null>(null);

export function WishlistProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        data: session,
        isPending,
    } = authClient.useSession();

    const userId = session?.user?.id;

    const [savedIds, setSavedIds] = useState<Set<string>>(
        new Set()
    );

    const [busyIds, setBusyIds] = useState<Set<string>>(
        new Set()
    );

    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!userId) {
            setSavedIds(new Set());
            setLoading(false);
            return;
        }

        setLoading(true);

        const result = await apiRequest<{
            success: boolean;
            studioIds: string[];
        }>("/api/wishlist", {
            cache: "no-store",
        });

        if (
            result.success &&
            Array.isArray(result.data.studioIds)
        ) {
            setSavedIds(new Set(result.data.studioIds));
        }

        setLoading(false);
    }, [userId]);

    useEffect(() => {
        if (isPending) return;

        let cancelled = false;

        Promise.resolve().then(() => {
            if (!cancelled) {
                void refresh();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [isPending, refresh]);

    const toggle = useCallback(
        async (id: string) => {
            if (!userId) {
                return {
                    success: false,
                    message: "Please sign in to save studios.",
                };
            }

            if (busyIds.has(id)) {
                return {
                    success: false,
                    message: "Please wait.",
                };
            }

            const currentlySaved = savedIds.has(id);

            setBusyIds((old) => new Set(old).add(id));

            const result = await apiRequest<{
                success: boolean;
            }>(
                `/api/wishlist/${encodeURIComponent(id)}`,
                {
                    method: currentlySaved ? "DELETE" : "PUT",
                }
            );

            if (result.success) {
                setSavedIds((old) => {
                    const next = new Set(old);

                    if (currentlySaved) {
                        next.delete(id);
                    } else {
                        next.add(id);
                    }

                    return next;
                });

                window.dispatchEvent(
                    new Event("frame:wishlist-changed")
                );
            }

            setBusyIds((old) => {
                const next = new Set(old);
                next.delete(id);
                return next;
            });

            return result.success
                ? { success: true }
                : {
                    success: false,
                    message: result.message,
                };
        },
        [userId, busyIds, savedIds]
    );

    const value = useMemo(
        () => ({
            savedIds,
            loading,
            busyIds,
            toggle,
            refresh,
            signedIn: Boolean(userId),
        }),
        [
            savedIds,
            loading,
            busyIds,
            toggle,
            refresh,
            userId,
        ]
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error(
            "useWishlist must be used within WishlistProvider"
        );
    }

    return context;
}
