
"use client";

import Link from "next/link";

import {
    ArrowUpRight,
    Camera,
    Clapperboard,
    Mic2,
    Music2,
    Paintbrush,
    PanelsTopLeft,
} from "lucide-react";

import { useStudioCategories } from "@/hooks/useStudioCategories";

// These descriptions and icons preserve Frame's existing design.
// Category names and slugs come from the backend.
const categoryDesign = {
    "photo-studio": {
        description:
            "Spaces for portraits, products, and editorial shoots.",
        icon: Camera,
    },
    "film-stage": {
        description:
            "Production spaces for film and video projects.",
        icon: Clapperboard,
    },
    "podcast-lounge": {
        description:
            "Recording spaces for podcasts and conversations.",
        icon: Mic2,
    },
    "music-suite": {
        description:
            "Creative environments for music and audio production.",
        icon: Music2,
    },
    workshop: {
        description:
            "Flexible spaces for hands-on creative sessions.",
        icon: Paintbrush,
    },
};

// Used only when the backend introduces a new category.
const defaultCategoryDesign = {
    description:
        "Discover creative spaces designed for your next project.",
    icon: PanelsTopLeft,
};

export default function StudioCategories() {
    const { categories } = useStudioCategories();

    return (
        <section
            id="studio-categories"
            aria-labelledby="categories-heading"
            className="border bg-neutral-50 px-5 py-20 sm:px-8 lg:py-28"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E60023]">
                            Find your fit
                        </p>

                        <h2
                            id="categories-heading"
                            className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
                        >
                            Browse by Category
                        </h2>

                        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
                            Whatever you&apos;re creating, find a space
                            that brings your vision to life.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-neutral-950 transition-colors hover:text-[#E60023]"
                    >
                        Explore all studios
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {categories.map((category) => {
                        const design =
                            categoryDesign[
                            category.slug as keyof typeof categoryDesign
                            ] ?? defaultCategoryDesign;

                        const Icon = design.icon;

                        const href = `/studios?category=${encodeURIComponent(
                            category.slug
                        )}`;

                        return (
                            <Link
                                key={category.slug}
                                href={href}
                                className="group flex min-h-64 flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 transition-colors group-hover:bg-[#E60023] group-hover:text-white">
                                        <Icon size={26} aria-hidden="true" />
                                    </div>

                                    <ArrowUpRight
                                        size={20}
                                        className="text-neutral-400 transition-colors group-hover:text-[#E60023]"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                                        {category.name}
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                                        {design.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
