"use client";

import { waitForFrameServer } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays, ChevronDown, Heart, LayoutDashboard, List,
  LogOut, Menu, PlusCircle, UserRound, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/#about-us" },
];

const accountNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Add New Studio", href: "/add-studio", icon: PlusCircle, highlight: true },
  { label: "My Studio Listings", href: "/my-listings", icon: List },
  { label: "My Bookings", href: "/my-bookings", icon: CalendarDays },
  { label: "Saved Wishlist", href: "/wishlist", icon: Heart },
];

type AccountUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function UserAvatar({ user, size = "normal" }: {
  user: AccountUser;
  size?: "normal" | "small";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = user.name?.trim() || "Creator";
  const dimensions = size === "small" ? "h-9 w-9" : "h-11 w-11";

  return (
    <span className={`relative inline-flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-50 text-sm font-semibold text-[#E60023] dark:bg-red-950/40 dark:text-red-300`}>
      {user.image && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={`${name}'s profile`}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

function useSignOut(onSuccess?: () => void) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      if (!(await waitForFrameServer())) {
        throw new Error("Frame services are still starting. Please try again shortly.");
      }
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message || "Unable to sign out.");
      }
      toast.success("Signed out successfully!");
      onSuccess?.();
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out. Please try again.";
      setSignOutError(message);
      toast.error(message);
    } finally {
      setSigningOut(false);
    }
  }

  return { signingOut, signOutError, handleSignOut };
}

const accountLinkStyle =
  "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white";

function DesktopAccountMenu({ user }: { user: AccountUser }) {
  const { signingOut, signOutError, handleSignOut } = useSignOut();
  const name = user.name?.trim() || "Frame Creator";
  const firstName = name.split(/\s+/)[0];

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-transparent py-1.5 pl-1.5 pr-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800 [&::-webkit-details-marker]:hidden" aria-label="Open account menu">
        <UserAvatar user={user} size="small" />
        <span className="max-w-28 truncate">{firstName}</span>
        <ChevronDown size={15} aria-hidden="true" className="shrink-0 text-neutral-500 transition-transform group-open:rotate-180 dark:text-neutral-400" />
      </summary>
      <div className="absolute right-0 top-[calc(100%+12px)] z-[60] w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-950/10 dark:border-neutral-800 dark:bg-[#17171A]">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-neutral-950 dark:text-white">{name}</p>
          <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email || "Frame creator"}</p>
        </div>
        <nav aria-label="Account navigation" className="space-y-1 p-2">
          {accountNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`${accountLinkStyle} ${item.highlight ? "text-[#E60023] dark:text-red-400" : ""}`}>
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
          <button type="button" onClick={() => void handleSignOut()} disabled={signingOut} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#E60023] transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40">
            <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
          {signOutError && <p role="alert" className="px-4 pb-2 text-xs text-red-700 dark:text-red-400">{signOutError}</p>}
        </div>
      </div>
    </details>
  );
}

function MobileSignOut({ onSuccess }: { onSuccess: () => void }) {
  const { signingOut, signOutError, handleSignOut } = useSignOut(onSuccess);
  return (
    <>
      <button type="button" onClick={() => void handleSignOut()} disabled={signingOut} className="flex min-h-14 w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-base font-semibold text-[#E60023] transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-[#E60023] disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40">
        <LogOut size={20} aria-hidden="true" />{signingOut ? "Signing out..." : "Sign Out"}
      </button>
      {signOutError && <p role="alert" className="px-5 text-sm text-red-700 dark:text-red-400">{signOutError}</p>}
    </>
  );
}

const drawerLinkStyle =
  "flex min-h-14 items-center gap-4 rounded-xl px-5 py-4 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);

  function closeMenu() { setMenuOpen(false); }

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      setMenuOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const handleResize = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener("change", handleResize);

    const oldOverflow = document.body.style.overflow;
    const oldPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    const focusFrame = window.requestAnimationFrame(() => drawerRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = oldOverflow;
      document.body.style.paddingRight = oldPaddingRight;
      document.removeEventListener("keydown", handleEscape);
      media.removeEventListener("change", handleResize);
    };
  }, [menuOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/studios") return pathname === "/studios" || pathname.startsWith("/studios/");
    if (href.startsWith("/#")) return false;
    return pathname === href;
  }

  return (
    <>
    <header className={`sticky top-0 ${menuOpen ? "z-[80]" : "z-50"} border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Frame home" onClick={closeMenu} className="shrink-0">
          <Image src="/images/brand/frame-logo.svg" alt="Frame" width={180} height={48} priority className="h-10 w-auto dark:hidden" />
          <Image src="/images/brand/frame-logo-white.svg" alt="" width={180} height={48} className="hidden h-10 w-auto dark:block" />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`border-b-2 py-2 text-sm font-medium transition-colors ${isActive(item.href) ? "border-[#E60023] text-neutral-950 dark:text-white" : "border-transparent text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isPending ? (
            <div aria-label="Loading account" className="h-11 w-32 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
          ) : user ? (
            <DesktopAccountMenu user={user} />
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800">Login</Link>
              <Link href="/register" className="rounded-full bg-[#E60023] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]">Register</Link>
            </>
          )}
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="frame-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-[70] flex h-11 w-11 items-center justify-center rounded-xl text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-[#E60023] dark:text-white dark:hover:bg-neutral-800 lg:hidden"
        >
          {menuOpen ? <X size={25} aria-hidden="true" /> : <Menu size={25} aria-hidden="true" />}
        </button>
      </div>

    </header>
      {menuOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-x-0 top-20 bottom-0 z-[60] lg:hidden" style={{ height: "calc(100dvh - 5rem)" }}>
          <button type="button" tabIndex={-1} aria-label="Close navigation menu" onClick={closeMenu} className="absolute inset-0 h-full w-full bg-neutral-950/55 backdrop-blur-[2px]" />
          <div
            id="frame-mobile-menu"
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 right-0 flex w-[min(23rem,88vw)] flex-col overflow-y-auto overscroll-contain border-l border-neutral-200 bg-white shadow-2xl outline-none dark:border-neutral-800 dark:bg-[#141416]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex-1 space-y-7 px-4 pb-10 pt-7 sm:px-6">
              <nav aria-label="Mobile navigation" className="space-y-2">
                <p className="px-5 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Explore Frame</p>
                {navigation.map((item) => (
                  <Link key={item.label} href={item.href} onClick={closeMenu} aria-current={isActive(item.href) ? "page" : undefined} className={`${drawerLinkStyle} ${isActive(item.href) ? "bg-red-50 text-[#C9001F] dark:bg-red-950/40 dark:text-red-300" : "text-neutral-900 hover:bg-neutral-200 hover:text-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white"}`}>
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
                {isPending ? (
                  <div className="mx-4 h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" aria-label="Loading account" />
                ) : user ? (
                  <>
                    <div className="mb-5 flex items-center gap-3 px-5">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-neutral-950 dark:text-white">{user.name?.trim() || "Frame Creator"}</p>
                        <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email || "Frame creator"}</p>
                      </div>
                    </div>
                    <nav aria-label="Account navigation" className="space-y-2">
                      {accountNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href} onClick={closeMenu} aria-current={isActive(item.href) ? "page" : undefined} className={`${drawerLinkStyle} ${isActive(item.href) ? "bg-red-50 text-[#C9001F] dark:bg-red-950/40 dark:text-red-300" : item.highlight ? "text-[#C9001F] hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" : "text-neutral-900 hover:bg-neutral-200 hover:text-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white"}`}>
                            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />{item.label}
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                      <MobileSignOut onSuccess={closeMenu} />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login" onClick={closeMenu} className={`${drawerLinkStyle} text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-neutral-800`}>
                      <UserRound size={20} aria-hidden="true" />Login
                    </Link>
                    <Link href="/register" onClick={closeMenu} className="flex min-h-14 items-center justify-center rounded-full bg-[#E60023] px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-[#C9001F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
