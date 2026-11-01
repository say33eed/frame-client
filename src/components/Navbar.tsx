
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const navigation = [
    { label: "Home", href: "/" },
    { label: "Explore Studios", href: "/studios" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About Us", href: "/#about-us" },
];

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        if (href === "/studios") {
            return pathname.startsWith("/studios");
        }
        return false;
    };

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
                <Link href="/" aria-label="Frame home" className="shrink-0">
                    <Image
                        src="/images/brand/frame-logo.svg"
                        alt="Frame"
                        width={180}
                        height={48}
                        priority
                        className="h-10 w-auto"
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
                </div>

                <details className="group relative lg:hidden">
                    <summary
                        aria-label="Open navigation menu"
                        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-neutral-900 hover:bg-neutral-100 [&::-webkit-details-marker]:hidden"
                    >
                        <Menu size={24} aria-hidden="true" />
                    </summary>

                    <nav
                        aria-label="Mobile navigation"
                        className="absolute right-0 top-12 w-64 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl"
                    >
                        {navigation.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="block rounded-lg px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="my-2 border-t border-neutral-200" />

                        <Link
                            href="/login"
                            className="block rounded-lg px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                        >
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="mt-2 block rounded-lg bg-[#E60023] px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                            Register
                        </Link>
                    </nav>
                </details>
            </div>
        </header>
    );
}
