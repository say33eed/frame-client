import { homeButton } from "@/components/homeButtonStyles";

import {
    ArrowUpRight,
    BadgeCheck,
    Headphones,
    ShieldCheck,
    Camera,
} from "lucide-react";
import Link from "next/link";

const assurances = [
    {
        number: "01",
        title: "Liability Protection",
        description:
            "Understand the importance of liability coverage before hosting or booking. Hosts and creators should confirm their own applicable insurance and responsibilities.",
        icon: ShieldCheck,
    },
    {
        number: "02",
        title: "Verified Profiles",
        description:
            "Review host information and studio details before making a reservation. Independent identity verification is not currently provided by Frame.",
        icon: BadgeCheck,
    },
    {
        number: "03",
        title: "Equipment Safety",
        description:
            "Review available equipment and amenities, confirm usage rules with the host, and follow safe operating practices throughout your session.",
        icon: Camera,
    },
    {
        number: "04",
        title: "24/7 Host Support",
        description:
            "Plan ahead by discussing access, equipment, and booking questions with your host. Round-the-clock staffed assistance is not currently offered.",
        icon: Headphones,
    },
];

export default function HostGuarantee() {
    return (
        <section
            id="host-guarantee"
            aria-labelledby="host-guarantee-heading"
            className="scroll-mt-20 border-t border-neutral-200 bg-white px-5 py-20 dark:border-white/10 dark:bg-[#111111] sm:px-8 lg:py-28"
        >
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#E60023]">
                            Confidence for every creation
                        </p>

                        <h2
                            id="host-guarantee-heading"
                            className="text-3xl font-bold leading-tight tracking-tight text-neutral-950 dark:text-white sm:text-4xl lg:text-[42px]"
                        >
                            Host Guarantee & Creator Support.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                            Great projects begin with clear expectations.
                            Explore four important considerations for
                            creating, hosting, and booking with confidence.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className={homeButton.text}
                    >
                        Explore studios
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {assurances.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.number}
                                className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-white/10 dark:bg-[#1C1C1C] sm:p-7"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#E60023] dark:bg-red-500/10">
                                        <Icon size={23} aria-hidden="true" />
                                    </span>

                                    <span className="text-xs font-semibold tracking-[0.12em] text-[#E60023]">
                                        {item.number}
                                    </span>
                                </div>

                                <h3 className="mt-7 text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
                                    {item.title}
                                </h3>

                                <p className="mt-3 flex-1 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                                    {item.description}
                                </p>

                                {/* <div className="mt-7 h-px w-full bg-neutral-200 dark:bg-white/10" /> */}

                                {/* <p className="mt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Know before you book
                                </p> */}
                            </article>
                        );
                    })}
                </div>

                {/* <p className="mt-8 max-w-4xl text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Note: These are booking and hosting guidance topics,
                    not guarantees of insurance coverage, verified
                    identities, equipment certification, or continuous
                    support services.
                </p> */}
            </div>
        </section>
    );
}
