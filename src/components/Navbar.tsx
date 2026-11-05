
"use client";

import { waitForFrameServer } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
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
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { toast } from "sonner";

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

const activeLink =
  "bg-red-50 text-neutral-950 hover:bg-red-100 dark:bg-[#49151C] dark:text-white dark:hover:bg-[#5B1922]";

const inactiveLink =
  "text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-100 dark:hover:bg-white/10 dark:hover:text-white";

const drawerLinkBase =
  "group flex min-h-14 w-full items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]";

const desktopLinkBase =
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]";

const menuIconButtonStyle =
  "group flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100/70 text-neutral-900 transition-colors duration-200 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-[#E60023] dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

function isCurrentRoute(
  pathname: string,
  href: string
) {
  if (href === "/") return pathname === "/";

  if (href === "/studios") {
    return (
      pathname === "/studios" ||
      pathname.startsWith("/studios/")
    );
  }

  if (href.startsWith("/#")) return false;

  return pathname === href;
}

function UserAvatar({
  user,
  small = false,
}: {
  user: AccountUser;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const name = user.name?.trim() || "Creator";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-red-50 font-semibold text-[#E60023] ring-0 dark:bg-red-950/40 dark:text-red-300 ${small ? "h-9 w-9" : "h-11 w-11"
        }`}
    >
      {user.image && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={`${name}'s profile`}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function SignOutButton({
  onSuccess,
  mobile = false,
}: {
  onSuccess?: () => void;
  mobile?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      if (!(await waitForFrameServer())) {
        throw new Error(
          "Frame services are still starting. Please try again shortly."
        );
      }

      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(
          result.error.message || "Unable to sign out."
        );
      }

      toast.success("Signed out successfully!");
      onSuccess?.();
      router.replace("/");
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to sign out.";

      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => void signOut()}
        className={`flex w-full items-center gap-3 rounded-2xl text-left font-semibold text-[#C9001F] transition-colors duration-200 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-[#E60023] disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30 ${mobile
            ? "min-h-14 px-5 py-4 text-[15px]"
            : "min-h-12 px-4 py-3 text-sm"
          }`}
      >
        <LogOut
          size={mobile ? 20 : 18}
          aria-hidden="true"
        />
        {busy ? "Signing out..." : "Sign Out"}
      </button>

      {error && (
        <p
          role="alert"
          className="px-4 py-2 text-xs text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </>
  );
}

function DesktopAccountMenu({
  user,
  pathname,
}: {
  user: AccountUser;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, close]);

  const name = user.name?.trim() || "Frame Creator";
  const firstName = name.split(/\s+/)[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls="frame-desktop-account-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-neutral-100/70 py-1.5 pl-1.5 pr-3 text-sm font-medium text-neutral-800 transition-colors duration-200 hover:bg-neutral-200/80 focus-visible:outline-2 focus-visible:outline-[#E60023] dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
      >
        <UserAvatar user={user} small />

        <span className="max-w-28 truncate">
          {firstName}
        </span>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`text-neutral-500 transition-transform duration-200 dark:text-neutral-400 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div
          id="frame-desktop-account-menu"
          className="absolute right-0 top-[calc(100%+12px)] z-[100] max-h-[min(75vh,650px)] w-72 overflow-y-auto overscroll-contain rounded-[22px] border border-neutral-200/70 bg-white/95 p-2 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-[#1A1A1D]/95"
        >
          <div className="border-b border-neutral-200/70 px-4 pb-4 pt-3 dark:border-white/10">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-neutral-950 dark:text-white">
              {name}
            </p>

            <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.email || "Frame creator"}
            </p>
          </div>

          <nav
            aria-label="Account navigation"
            className="space-y-2 py-3"
          >
            {accountNavigation.map((item) => {
              const Icon = item.icon;
              const active = isCurrentRoute(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`${desktopLinkBase} ${active ? activeLink : inactiveLink
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

          <div className="border-t border-neutral-200/70 pt-2 dark:border-white/10">
            <SignOutButton onSuccess={close} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } =
    authClient.useSession();

  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      closeMenu();
    }
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;

    const media = window.matchMedia(
      "(min-width: 1024px)"
    );

    function handleResize() {
      if (media.matches) closeMenu();
    }

    media.addEventListener("change", handleResize);

    const previousBodyOverflow =
      document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;
    const previousPadding =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow =
      "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        menuButtonRef.current?.focus();
      }

      if (event.key === "Tab") {
        const drawer = drawerRef.current;
        if (!drawer) return;

        const focusable = Array.from(
          drawer.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const frame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);

      document.body.style.overflow =
        previousBodyOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;
      document.body.style.paddingRight =
        previousPadding;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
      media.removeEventListener(
        "change",
        handleResize
      );
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
      {/* Transparent frosted-glass navbar */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/50 bg-white/65 shadow-sm shadow-black/[0.02] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-neutral-950/55 dark:shadow-black/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/"
            onClick={closeMenu}
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
            {navigation.map((item) => {
              const active = isCurrentRoute(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`border-b-2 py-2 text-sm font-medium transition-colors duration-200 ${active
                      ? "border-[#E60023] text-neutral-950 dark:text-white"
                      : "border-transparent text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <div className="hidden lg:block">
              {isPending ? (
                <div
                  aria-label="Loading account"
                  className="h-11 w-32 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800"
                />
              ) : user ? (
                <DesktopAccountMenu
                  key={pathname}
                  user={user}
                  pathname={pathname}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-full bg-[#E60023] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger button */}
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="frame-mobile-menu"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className={`${menuIconButtonStyle} lg:hidden`}
            >
              <Menu
                size={24}
                aria-hidden="true"
                className="transition-colors duration-200 group-hover:!text-[#E60023]"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Animated mobile/tablet drawer */}
      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[100] lg:hidden ${menuOpen
                ? "pointer-events-auto"
                : "pointer-events-none"
              }`}
            aria-hidden={!menuOpen}
            inert={!menuOpen}
          >
            {/* Backdrop */}
            <button
              type="button"
              tabIndex={-1}
              aria-label="Close navigation menu"
              onClick={closeMenu}
              className={`absolute inset-0 h-full w-full bg-neutral-950/45 backdrop-blur-[3px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Right-side drawer */}
            <div
              id="frame-mobile-menu"
              ref={drawerRef}
              role="dialog"
              aria-modal={menuOpen ? "true" : undefined}
              aria-label="Navigation menu"
              className={`absolute inset-y-0 right-0 flex h-full w-[min(24rem,90vw)] flex-col bg-white/95 shadow-2xl shadow-black/15 backdrop-blur-2xl transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-[#171719]/95 ${menuOpen
                  ? "translate-x-0"
                  : "translate-x-full"
                }`}
            >
              {/* Drawer header */}
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-neutral-200/70 px-6 dark:border-white/10">
                <span className="text-sm font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                  Frame
                </span>

                {/* Close button — exactly matches hamburger */}
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => {
                    closeMenu();
                    menuButtonRef.current?.focus();
                  }}
                  aria-label="Close navigation menu"
                  className={menuIconButtonStyle}
                >
                  <X
                    size={24}
                    aria-hidden="true"
                    className="transition-colors duration-200 group-hover:!text-[#E60023]"
                  />
                </button>
              </div>

              {/* Independently scrollable drawer content */}
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-10 pt-6 sm:px-6"
                style={{
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <nav
                  aria-label="Mobile navigation"
                  className="space-y-2"
                >
                  {navigation.map((item) => {
                    const active = isCurrentRoute(
                      pathname,
                      item.href
                    );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        aria-current={
                          active ? "page" : undefined
                        }
                        className={`${drawerLinkBase} ${active ? activeLink : inactiveLink
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-7 border-t border-neutral-200/70 pt-6 dark:border-white/10">
                  {isPending ? (
                    <div
                      aria-label="Loading account"
                      className="mx-4 h-14 animate-pulse rounded-2xl bg-neutral-100 dark:bg-white/10"
                    />
                  ) : user ? (
                    <>
                      <div className="mb-5 flex items-center gap-3 px-5">
                        <UserAvatar user={user} />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                            {user.name?.trim() ||
                              "Frame Creator"}
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {user.email || "Frame creator"}
                          </p>
                        </div>
                      </div>

                      <nav
                        aria-label="Account navigation"
                        className="space-y-2"
                      >
                        {accountNavigation.map(
                          (item) => {
                            const Icon = item.icon;
                            const active = isCurrentRoute(
                              pathname,
                              item.href
                            );

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMenu}
                                aria-current={
                                  active
                                    ? "page"
                                    : undefined
                                }
                                className={`${drawerLinkBase} ${active
                                    ? activeLink
                                    : inactiveLink
                                  }`}
                              >
                                <Icon
                                  size={20}
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                                {item.label}
                              </Link>
                            );
                          }
                        )}
                      </nav>

                      <div className="mt-6 border-t border-neutral-200/70 pt-4 dark:border-white/10">
                        <SignOutButton
                          mobile
                          onSuccess={closeMenu}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className={`${drawerLinkBase} ${inactiveLink}`}
                      >
                        <UserRound
                          size={20}
                          aria-hidden="true"
                        />
                        Login
                      </Link>

                      <Link
                        href="/register"
                        onClick={closeMenu}
                        className="flex min-h-14 items-center justify-center rounded-full bg-[#E60023] px-5 py-4 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#C9001F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
