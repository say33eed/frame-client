
import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";

export default function FeaturedStudios() {
    return (
        <section
            id="featured-studios"
            aria-labelledby="featured-heading"
            className="bg-white px-5 py-20 sm:px-8 lg:py-28"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E60023]">
                            Discover Frame
                        </p>

                        <h2
                            id="featured-heading"
                            className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
                        >
                            Featured Studios
                        </h2>

                        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
                            Explore spaces made for your next big idea.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-neutral-950 transition-colors hover:text-[#E60023]"
                    >
                        View all studios
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </div>

                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm">
                        <Camera size={25} aria-hidden="true" />
                    </div>

                    <h3 className="text-xl font-semibold text-neutral-950">
                        Inspiring spaces are coming soon
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                        Featured studios will appear here as hosts publish
                        their spaces on Frame.
                    </p>

                    <Link
                        href="/studios"
                        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#E60023] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                    >
                        Explore Studios
                    </Link>
                </div>
            </div>
        </section>
    );
}
