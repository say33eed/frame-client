
import Link from "next/link";
import {
    ArrowUpRight,
    Camera,
    Clapperboard,
    Mic2,
    Palette,
} from "lucide-react";

const categories = [
    {
        name: "Photography",
        description: "Portraits, products, and editorial shoots.",
        icon: Camera,
        href: "/studios?category=photography",
    },
    {
        name: "Film & Video",
        description: "Production spaces for stories in motion.",
        icon: Clapperboard,
        href: "/studios?category=film-video",
    },
    {
        name: "Podcast & Audio",
        description: "Recording spaces for every voice.",
        icon: Mic2,
        href: "/studios?category=podcast-audio",
    },
    {
        name: "Creative Spaces",
        description: "Flexible studios for your next big idea.",
        icon: Palette,
        href: "/studios?category=creative",
    },

];

export default function StudioCategories() {
    return (
        <section
            id="studio-categories"
            aria-labelledby="categories-heading"
            className="bg-neutral-50 px-5 py-20 sm:px-8 lg:py-28"
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


                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.name}
                                href={category.href}
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
                                        {category.description}
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
