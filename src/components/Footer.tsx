
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const navigation = [
  { label: "Explore studios", href: "/studios" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About Frame", href: "/#about-us" },
  { label: "List your studio", href: "/add-studio" },
  { label: "My bookings", href: "/my-bookings" },
];

const categories = [
  { label: "Photography", slug: "photo-studio" },
  { label: "Film & video", slug: "film-stage" },
  { label: "Podcast studios", slug: "podcast-lounge" },
  { label: "Music suites", slug: "music-suite" },
  { label: "Creative workshops", slug: "workshop" },
];

const linkStyle =
  "text-sm text-neutral-600 transition-colors hover:text-[#E60023] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E60023] dark:text-neutral-400 dark:hover:text-red-400";

const socialStyle =
  "flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-[#E60023] hover:bg-red-50 hover:text-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-[#E60023] dark:hover:bg-red-950/30 dark:hover:text-red-400";

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.901 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-7.42L5.57 22H2.47l7.24-8.28L1.8 2h6.4l4.42 6.75L18.9 2Zm-1.09 18h1.72L7.26 3.9H5.41L17.81 20Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle
        cx="17.6"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a2.999 2.999 0 0 0-2.111-2.124C19.518 3.56 12 3.56 12 3.56s-7.518 0-9.387.502A2.999 2.999 0 0 0 .502 6.186 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.111 2.124c1.869.502 9.387.502 9.387.502s7.518 0 9.387-.502a2.999 2.999 0 0 0 2.111-2.124A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.502-5.814ZM9.6 15.568V8.432L15.84 12 9.6 15.568Z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const result = await apiRequest<{ message?: string }>(
        "/api/newsletter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      setSubscribed(true);
      setEmail("");
      setMessage(result.data?.message || "You're on the list!");
    } catch (error) {
      setSubscribed(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Please try again later."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white text-neutral-950 dark:border-neutral-800 dark:bg-[#111114] dark:text-white">
      {/* Trust highlights */}
      <div className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-[#17171A]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:grid-cols-3 sm:gap-8 sm:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Book with confidence",
              detail: "Clear details. Confident decisions.",
            },
            {
              icon: Camera,
              title: "Spaces for every craft",
              detail: "Photography, film, music and more.",
            },
            {
              icon: Sparkles,
              title: "Made for creators",
              detail: "Where great ideas find their space.",
            },
          ].map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-start lg:text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E60023] dark:bg-red-950/30 dark:text-red-400">
                <Icon size={21} aria-hidden="true" />
              </span>

              <div>
                <p className="text-sm font-semibold">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-8 lg:pt-16">
        <div className="grid grid-cols-1 justify-items-center gap-x-10 gap-y-12 text-center sm:grid-cols-2 lg:grid-cols-[1.65fr_0.8fr_0.9fr_0.85fr] lg:justify-items-stretch lg:text-left">
          {/* Brand and newsletter */}
          <div className="flex w-full max-w-sm flex-col items-center lg:max-w-none lg:items-start">
            <Link
              href="/"
              aria-label="Frame home"
              className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E60023]"
            >
              <Image
                src="/images/brand/frame-logo.svg"
                width={145}
                height={48}
                alt="Frame"
                className="h-auto w-36 dark:hidden"
              />
              <Image
                src="/images/brand/frame-logo-white.svg"
                width={145}
                height={48}
                alt="Frame"
                className="hidden h-auto w-36 dark:block"
              />
            </Link>

            <p className="mt-5 max-w-sm text-center text-sm leading-7 text-neutral-600 lg:text-left dark:text-neutral-400">
              A home for creative spaces and the people
              who bring them to life.
              <span className="mt-1 block font-medium text-neutral-900 dark:text-neutral-200">
                Find your space. Create without limits.
              </span>
            </p>

            <form
              onSubmit={subscribe}
              className="mt-8 w-full max-w-sm"
            >
              <label
                htmlFor="footer-email"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.16em]"
              >
                The Frame newsletter
              </label>

              <p className="mb-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                Creative inspiration and studio updates,
                delivered to your inbox.
              </p>

              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Mail
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="footer-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="Your email address"
                    value={email}
                    disabled={busy}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setMessage("");
                      setSubscribed(false);
                    }}
                    className="h-12 w-full rounded-xl border border-neutral-300 bg-white pr-3 pl-10 text-sm text-neutral-950 outline-none transition focus:border-[#E60023]   disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 "
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  aria-label="Subscribe to the Frame newsletter"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E60023] text-white transition-colors hover:bg-[#C9001F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:cursor-wait disabled:opacity-60"
                >
                  {subscribed ? (
                    <Check size={19} />
                  ) : (
                    <ArrowRight size={19} />
                  )}
                </button>
              </div>

              {message && (
                <p
                  role="status"
                  className={`mt-3 text-xs ${subscribed
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                    }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Explore */}
          <nav
            aria-label="Footer navigation"
            className="w-full text-center lg:text-left"
          >
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.17em]">
              Explore
            </h2>

            <ul className="space-y-4">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={linkStyle}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav
            aria-label="Studio categories"
            className="w-full text-center lg:text-left"
          >
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.17em]">
              Studio categories
            </h2>

            <ul className="space-y-4">
              {categories.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/studios?category=${encodeURIComponent(
                      item.slug
                    )}`}
                    className={linkStyle}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div className="flex w-full flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.17em]">
              Connect
            </h2>

            <p className="mb-5 max-w-[210px] text-center text-sm leading-6 text-neutral-600 lg:text-left dark:text-neutral-400">
              Stay connected with the creative community.
            </p>

            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (opens in a new tab)"
                className={socialStyle}
              >
                <XIcon />
              </a>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram (opens in a new tab)"
                className={socialStyle}
              >
                <InstagramIcon />
              </a>

              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube (opens in a new tab)"
                className={socialStyle}
              >
                <YouTubeIcon />
              </a>
            </div>

            <p className="mt-6 text-xs leading-6 text-neutral-500 dark:text-neutral-400">
              Built for creators,
              <span className="block">
                by creators.
              </span>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 flex flex-col items-center justify-center gap-3 border-t border-neutral-200 pt-7 text-center text-xs text-neutral-500 lg:flex-row lg:justify-between lg:text-left dark:border-neutral-800 dark:text-neutral-400">
          <p>
            &copy; {new Date().getFullYear()} Frame.
            All rights reserved.
          </p>

          <p>
            Find your space. Create without limits.
          </p>
        </div>
      </div>
    </footer>
  );
}
