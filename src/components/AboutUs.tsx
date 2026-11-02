
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowUpRight,
    CalendarCheck,
    Camera,
    Search,
    Store,
} from "lucide-react";

const features = [
    {
        title: "Discover Creative Spaces",
        description:
            "Explore studios for photography, film, podcasts, and other creative projects.",
        icon: Search,
    },
    {
        title: "Connect with Studio Hosts",
        description:
            "View studio details and find spaces offered by hosts in the creative community.",
        icon: Store,
    },
    {
        title: "Plan Your Studio Booking",
        description:
            "Choose a space and request a booking for your preferred date and time.",
        icon: CalendarCheck,
    },
    {
        title: "Create Without Limits",
        description:
            "Find an environment that supports your vision, from first concept to final production.",
        icon: Camera,
    },
];

export default function AboutUs() {
    return (
        <section
            id="about-us"
            aria-labelledby="about-us-heading"
            className="scroll-mt-24 mt-24 bg-[#FAF9F8] px-5 py-20 sm:px-8 lg:py-28"
        >
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#E60023]">
                        About Frame
                    </p>

                    <h2
                        id="about-us-heading"
                        className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-4xl lg:text-[42px]"
                    >
                        Great Creative Work Starts with the Right Space.
                    </h2>

                    <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-600">
                        Frame connects creators with inspiring studios
                        for photography, filmmaking, podcasting, and
                        more. We believe finding the right creative
                        environment should be simple.
                    </p>

                    <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-600">
                        Whether you&apos;re searching for a space to
                        bring your ideas to life or sharing your own
                        studio with others, Frame helps bring creative
                        people and places together.
                    </p>



                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link
                            href="/add-studio"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            List Your Studio
                            <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>

                        <Link
                            href="/studios"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 px-7 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
                        >
                            Explore Studios
                        </Link>
                    </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                            >
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E60023]">
                                    <Icon size={21} aria-hidden="true" />
                                </div>

                                <h3 className="text-base font-semibold leading-snug text-neutral-950">
                                    {feature.title}
                                </h3>

                                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
