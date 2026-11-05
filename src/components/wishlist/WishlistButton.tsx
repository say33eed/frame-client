
"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWishlist } from "./WishlistProvider";

export default function WishlistButton({
    studioId,
    className = "",
}: {
    studioId: string;
    className?: string;
}) {
    const router = useRouter();

    const {
        savedIds,
        busyIds,
        loading,
        signedIn,
        toggle,
    } = useWishlist();

    const saved = savedIds.has(studioId);
    const busy = busyIds.has(studioId);

    return (
        <button
            type="button"
            aria-label={
                saved
                    ? "Remove studio from wishlist"
                    : "Save studio to wishlist"
            }
            aria-pressed={saved}
            title={
                saved
                    ? "Remove from wishlist"
                    : "Save to wishlist"
            }
            disabled={busy || (signedIn && loading)}
            onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (!signedIn) {
                    toast.info(
                        "Sign in to save studios to your wishlist."
                    );

                    router.push(
                        `/login?redirect=${encodeURIComponent(
                            window.location.pathname
                        )}`
                    );
                    return;
                }

                const result = await toggle(studioId);

                if (!result.success) {
                    toast.error(
                        result.message ||
                        "Unable to update wishlist."
                    );
                } else {
                    toast.success(
                        saved
                            ? "Removed from wishlist"
                            : "Saved to wishlist"
                    );
                }
            }}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-sm transition-colors hover:border-[#E60023] hover:text-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:cursor-wait disabled:opacity-60 ${className}`}
        >
            <Heart
                size={20}
                className={
                    saved
                        ? "fill-[#E60023] text-[#E60023]"
                        : ""
                }
                aria-hidden="true"
            />
        </button>
    );
}
