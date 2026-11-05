"use client";

import { waitForFrameServer } from "@/lib/api";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    CalendarDays,
    ChevronDown,
    Heart,
    LayoutDashboard,
    List,
    LogOut,
    Menu,
    PlusCircle,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const navigation = [
    { label: "Home", href: "/" },
    { label: "Explore Studios", href: "/studios" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About Us", href: "/#about-us" },
];

const accountNavigation = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Add New Studio",
        href: "/add-studio",
        icon: PlusCircle,
        highlight: true,
    },
    {
        label: "My Studio Listings",
        href: "/my-listings",
        icon: List,
    },
    {
        label: "My Bookings",
        href: "/my-bookings",
        icon: CalendarDays,
    },
    {
        label: "Saved Wishlist",
        href: "/wishlist",
        icon: Heart,
    },
];

type AccountUser = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

function UserAvatar({
    user,
    size = "normal",
}: {
    user: AccountUser;
    size?: "normal" | "small";
}) {
    const [imageFailed, setImageFailed] = useState(false);

    const name = user.name?.trim() || "Creator";
    const initial = name.charAt(0).toUpperCase();

    const dimensions =
        size === "small" ? "h-9 w-9" : "h-10 w-10";

    return (
        <span
            className={`relative inline-flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-50 text-sm font-semibold text-[#E60023] ring-2 ring-white`}
        >
            {user.image && !imageFailed ? (
                // External profile photos may come from arbitrary user-provided URLs.
                // A regular img avoids requiring a Next.js remote image allowlist.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={user.image}
                    alt={`${name}'s profile`}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                />
            ) : (
                <span aria-hidden="true">{initial}</span>
            )}
        </span>
    );
}

function AccountMenu({
    user,
    mobile = false,
}: {
    user: AccountUser;
    mobile?: boolean;
}) {
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState("");

    const name = user.name?.trim() || "Frame Creator";
    const firstName = name.split(/\s+/)[0];

    function showSignOutError(message: string) {
        setSignOutError(message);

        if (message.trim()) {
            toast.error(message);
        }
    }
    async function handleSignOut() {
        if (signingOut) return;

        setSigningOut(true);
        setSignOutError("");

        try {
            if (!(await waitForFrameServer())) {
                showSignOutError("Frame services are still starting. Please try again shortly.");
                return;
            }
            const result = await authClient.signOut();

            if (result.error) {
                showSignOutError(
                    result.error.message || "Unable to sign out."
                );
                return;
            }

            toast.success("Signed out successfully!");
            router.replace("/");
            router.refresh();
        } catch {
            showSignOutError("Unable to sign out. Please try again.");
        } finally {
            setSigningOut(false);
        }
    }

    return (
        <details
            className={
                mobile
                    ? "group relative w-full"
                    : "group relative"
            }
        >
            <summary
                className={`flex cursor-pointer list-none items-center gap-2 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 [&::-webkit-details-marker]:hidden ${mobile ? "w-full justify-between" : ""
                    }`}
                aria-label="Open account menu"
            >
                <span className="flex min-w-0 items-center gap-2">
                    <UserAvatar user={user} size="small" />
                    <span className="max-w-28 truncate">{firstName}</span>
                </span>

                <ChevronDown
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-neutral-500 transition-transform group-open:rotate-180"
                />
            </summary>

            <div
                className={
                    mobile
                        ? "mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                        : "absolute right-0 top-[calc(100%+12px)] z-[60] w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-950/10"
                }
            >
                <div className="border-b border-neutral-100 px-5 py-4">
                    <p className="text-xs text-neutral-400">
                        Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-neutral-950">
                        {name}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-500">
                        {user.email || "Frame creator"}
                    </p>
                </div>

                <nav
                    aria-label="Account navigation"
                    className="p-2"
                >
                    {accountNavigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-neutral-50 ${item.highlight
                                        ? "text-[#E60023]"
                                        : "text-neutral-700 hover:text-neutral-950"
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-neutral-100 p-2">
                    <button
                        type="button"
                        onClick={() => void handleSignOut()}
                        disabled={signingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#E60023] transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                        <LogOut
                            size={18}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                        {signingOut ? "Signing out..." : "Sign Out"}
                    </button>

                    {signOutError && (
                        <p
                            role="alert"
                            className="px-3 pb-2 text-xs text-red-700"
                        >
                            {signOutError}
                        </p>
                    )}
                </div>
            </div>
        </details>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, isPending } =
        authClient.useSession();

    const user = session?.user;

    function isActive(href: string) {
        if (href === "/") return pathname === "/";

        if (href === "/studios") {
            return pathname === "/studios" ||
                pathname.startsWith("/studios/");
        }

        if (href.startsWith("/#")) {
            return false;
        }

        return pathname === href;
    }

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
                <Link
                    href="/"
                    aria-label="Frame home"
                    className="shrink-0"
                >
                    <Image
                        src="/images/brand/frame-logo.svg"
                        alt="Frame"
                        width={180}
                        height={48}
                        priority
                        className="h-10 w-auto dark:hidden"
                    />
                    <Image
                        src="/images/brand/frame-logo-white.svg"
                        alt=""
                        width={180}
                        height={48}
                        className="hidden h-10 w-auto dark:block"
                    />
                </Link>

                <nav
                    aria-label="Main navigation"
                    className="hidden items-center gap-7 lg:flex"
                >
                    {navigation.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            aria-current={
                                isActive(item.href) ? "page" : undefined
                            }
                            className={`border-b-2 py-2 text-sm font-medium transition-colors ${isActive(item.href)
                                    ? "border-[#E60023] text-neutral-950"
                                    : "border-transparent text-neutral-600 hover:text-neutral-950"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    {isPending ? (
                        <div
                            aria-label="Loading account"
                            className="h-11 w-32 animate-pulse rounded-full bg-neutral-100"
                        />
                    ) : user ? (
                        <AccountMenu user={user} />
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-full px-4 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-full bg-[#E60023] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                <details className="group relative lg:hidden">
                    <summary
                        aria-label="Open navigation menu"
                        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-neutral-900 hover:bg-neutral-100 [&::-webkit-details-marker]:hidden"
                    >
                        <Menu size={24} aria-hidden="true" />
                    </summary>

                    <div className="absolute right-0 top-12 z-[60] w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
                        <nav aria-label="Mobile navigation">
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-current={
                                        isActive(item.href) ? "page" : undefined
                                    }
                                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive(item.href)
                                            ? "bg-red-50 text-[#E60023]"
                                            : "text-neutral-800 hover:bg-neutral-100"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="my-2 border-t border-neutral-200" />

                        {isPending ? (
                            <div className="h-11 animate-pulse rounded-full bg-neutral-100" />
                        ) : user ? (
                            <AccountMenu user={user} mobile />
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="block rounded-lg px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                                >
                                    <span className="flex items-center gap-2">
                                        <UserRound size={17} aria-hidden="true" />
                                        Login
                                    </span>
                                </Link>

                                <Link
                                    href="/register"
                                    className="mt-2 block rounded-lg bg-[#E60023] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#C9001F]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </details>
            </div>
        </header>
    );
}
