"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Check, CameraIcon, Mail, ShieldCheck, Sparkles, Video } from "lucide-react";

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

const linkStyle = "text-sm text-neutral-600 transition-colors hover:text-[#E60023] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E60023] dark:text-neutral-400 dark:hover:text-red-400";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18.901 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-7.42L5.57 22H2.47l7.24-8.28L1.8 2h6.4l4.42 6.75L18.9 2Zm-1.09 18h1.72L7.26 3.9H5.41L17.81 20Z" />
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
      const api = ((process.env.NODE_ENV === "production" ? "https://frame-client.vercel.app" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"))).replace(/\/+$/, "");
      const response = await fetch(`${api}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Unable to subscribe right now.");
      setSubscribed(true);
      setEmail("");
      setMessage(data?.message || "You're on the list!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white text-neutral-950 dark:border-neutral-800 dark:bg-[#111114] dark:text-white">
      <div className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:gap-12">
          {[
            { icon: ShieldCheck, title: "Book with confidence", detail: "Clear studio details and booking information" },
            { icon: Camera, title: "Made for your craft", detail: "Spaces for photography, film, sound and more" },
            { icon: Sparkles, title: "Create your next thing", detail: "Find the setting that fits your vision" },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#E60023] dark:bg-red-950/40 dark:text-red-400"><Icon size={21} aria-hidden="true" /></span>
              <div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{detail}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 lg:pt-20">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.6fr_0.8fr_0.9fr_1fr]">
          <div>
            <Link href="/" aria-label="Frame home" className="inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E60023]">
              <Image src="/images/brand/frame-logo.svg" width={145} height={48} alt="Frame" className="h-auto w-36 dark:hidden" />
              <Image src="/images/brand/frame-logo-white.svg" width={145} height={48} alt="Frame" className="hidden h-auto w-36 dark:block" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600 dark:text-neutral-400">A home for creative spaces and the people who bring them to life. Find your space. Create without limits.</p>
            <form onSubmit={subscribe} className="mt-8 max-w-sm">
              <label htmlFor="footer-email" className="mb-3 block text-xs font-bold uppercase tracking-[0.16em]">The Frame newsletter</label>
              <p className="mb-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400">Studio inspiration and creative updates, straight to your inbox.</p>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                  <input id="footer-email" type="email" autoComplete="email" required maxLength={254} placeholder="Your email address" value={email} onChange={event => { setEmail(event.target.value); setMessage(""); setSubscribed(false); }} className="h-12 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3 text-sm text-neutral-950 outline-none transition focus:border-[#E60023] focus:ring-2 focus:ring-red-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-red-950" />
                </div>
                <button type="submit" disabled={busy} aria-label="Subscribe to the Frame newsletter" className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E60023] text-white transition hover:bg-[#c9001f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:cursor-wait disabled:opacity-60">{subscribed ? <Check size={19} /> : <ArrowRight size={19} />}</button>
              </div>
              {message && <p role="status" className={`mt-2 text-xs ${subscribed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{message}</p>}
            </form>
          </div>

          <nav aria-label="Footer navigation"><h2 className="mb-5 text-xs font-bold uppercase tracking-[0.17em]">Explore</h2><ul className="space-y-3">{navigation.map(item => <li key={item.href}><Link className={linkStyle} href={item.href}>{item.label}</Link></li>)}</ul></nav>
          <nav aria-label="Studio categories"><h2 className="mb-5 text-xs font-bold uppercase tracking-[0.17em]">Studio categories</h2><ul className="space-y-3">{categories.map(item => <li key={item.slug}><Link className={linkStyle} href={`/studios?category=${encodeURIComponent(item.slug)}`}>{item.label}</Link></li>)}</ul></nav>
          <div><h2 className="mb-5 text-xs font-bold uppercase tracking-[0.17em]">Connect</h2><p className="mb-5 text-sm leading-6 text-neutral-600 dark:text-neutral-400">Follow the creative conversation.</p><div className="flex items-center gap-2">
            {[
              { label: "X", href: "https://x.com", icon: <XIcon /> },
              { label: "Instagram", href: "https://www.instagram.com", icon: <CameraIcon size={19} /> },
              { label: "YouTube", href: "https://www.youtube.com", icon: <Video size={19} /> },
            ].map(item => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${item.label} (external site)`} className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 transition hover:border-[#E60023] hover:bg-red-50 hover:text-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-red-950/40">{item.icon}</a>)}
          </div><p className="mt-5 text-xs leading-6 text-neutral-500 dark:text-neutral-400">Have a question? Explore Frame or get in touch through our official channels.</p></div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:text-neutral-400"><p>Â© {new Date().getFullYear()} Frame. All rights reserved.</p><p>Built for creators, by creators. <span className="mx-2 text-neutral-300 dark:text-neutral-700">â€¢</span> Terms and privacy information available on request.</p></div>
      </div>
    </footer>
  );
}

