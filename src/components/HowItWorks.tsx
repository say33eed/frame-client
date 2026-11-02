
import Link from "next/link";

import {
    ArrowUpRight,
    CalendarClock,
    CalendarCheck,
    Clapperboard,
    Search,
} from "lucide-react";



const steps = [
    {
        number: "01",
        title: "Discover Spaces",
        description:
            "Explore creative studios and find the right space for your project.",
        icon: Search,
    },
    {
        number: "02",
        title: "Select Shoot Hours",
        description:
            "Choose your preferred date and time for your studio session.",
        icon: CalendarClock,
    },
    {
        number: "03",
        title: "Book Instantly",
        description:
            "Submit your booking request and track its status in Frame.",
        icon: CalendarCheck,
    },
    {
        number: "04",
        title: "Create & Produce",
        description:
            "Use your booked studio to bring your creative vision to life.",
        icon: Clapperboard,
    },
];


export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            aria-labelledby="how-it-works-heading"
            className="scroll-mt-34 bg-white px-5 py-0 sm:px-8 lg:py-0"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E60023]">
                        Simple by design
                    </p>

                    <h2
                        id="how-it-works-heading"
                        className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
                    >
                        How It Works
                    </h2>

                    <p className="mt-4 text-base leading-relaxed text-neutral-600">
                        From finding the right studio to creating something
                        extraordinary, Frame makes the process simple.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {steps.map((step) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.number}
                                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8"
                            >
                                <div className="mb-12 flex items-start justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-neutral-950 shadow-sm">
                                        <Icon size={26} aria-hidden="true" />
                                    </div>

                                    <span className="text-sm font-semibold tracking-wider text-[#E60023]">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/studios"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                    >
                        Find Your Studio
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
