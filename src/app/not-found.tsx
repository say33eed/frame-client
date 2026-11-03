
import Link from "next/link";
import {
    ArrowRight,
    Aperture,
    Camera,
    Clapperboard,
    Home,
    Search,
} from "lucide-react";

export default function NotFound() {
    return (
        <main className="relative flex min-h-[calc(100vh-90px)] items-center overflow-hidden bg-neutral-50 px-5 py-16 text-neutral-950 dark:bg-neutral-950 dark:text-white sm:px-8">
            {/* Subtle background grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
                style={{
                    backgroundImage:
                        "linear-gradient(#777 1px, transparent 1px), linear-gradient(90deg, #777 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
                {/* Copy */}
                <div className="order-2 text-center lg:order-1 lg:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#E60023] dark:border-red-900/40 dark:bg-red-950/30">
                        <Aperture size={15} />
                        Lost Between Frames
                    </div>

                    <h1 className="mt-7 text-7xl font-bold tracking-[-0.08em] text-neutral-950 dark:text-white sm:text-8xl lg:text-9xl">
                        4
                        <span className="text-[#E60023]">0</span>
                        4
                        <span className="text-[#E60023]">.</span>
                    </h1>

                    <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                        This scene didn&apos;t make the cut.
                    </h2>

                    <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-neutral-500 dark:text-neutral-400 lg:mx-0">
                        Looks like this page is out of frame. The
                        creative space you&apos;re looking for may have
                        moved, or the link might be incorrect.
                        Your next great project is still waiting.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                        <Link
                            href="/"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#C9001F] hover:shadow-md"
                        >
                            <Home size={17} />
                            Return to Home
                            <ArrowRight size={16} />
                        </Link>

                        <Link
                            href="/studios"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-7 text-sm font-semibold text-neutral-900 transition-colors hover:border-[#E60023] hover:text-[#E60023] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:border-[#E60023]"
                        >
                            <Search size={17} />
                            Explore Studios
                        </Link>
                    </div>

                    {/* <p className="mt-9 flex items-center justify-center gap-2 text-xs font-medium text-neutral-400 lg:justify-start">
                        <ArrowLeft size={14} />
                        Every great story deserves the right space.
                    </p> */}
                </div>

                {/* Creative studio illustration */}
                <div
                    aria-hidden="true"
                    className="relative order-1 mx-auto flex w-full max-w-[520px] items-center justify-center lg:order-2"
                >
                    <div className="absolute inset-10 rounded-full bg-red-100/70 blur-3xl dark:bg-red-950/40" />

                    <div className="relative aspect-square w-full">
                        {/* Orbit */}
                        <div className="absolute inset-[8%] rounded-full border border-dashed border-neutral-300 dark:border-neutral-700" />

                        <div className="absolute inset-[18%] rounded-full border border-neutral-200 dark:border-neutral-800" />

                        {/* Top-right clapperboard */}
                        <div className="absolute right-[4%] top-[8%] z-10 grid size-20 rotate-12 place-items-center rounded-3xl border border-neutral-200 bg-white text-neutral-950 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-white sm:size-24">
                            <Clapperboard
                                size={38}
                                strokeWidth={1.7}
                            />
                        </div>

                        {/* Bottom-left camera */}
                        <div className="absolute bottom-[10%] left-[3%] z-10 grid size-20 -rotate-12 place-items-center rounded-3xl bg-[#E60023] text-white shadow-xl shadow-red-200 dark:shadow-none sm:size-24">
                            <Camera
                                size={38}
                                strokeWidth={1.7}
                            />
                        </div>

                        {/* Main frame */}
                        <div className="absolute inset-[20%] flex items-center justify-center rounded-[2.5rem] border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/70 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none">
                            <div className="absolute left-5 top-5 flex gap-2">
                                <span className="size-2.5 rounded-full bg-[#E60023]" />
                                <span className="size-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                <span className="size-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            </div>

                            {/* Viewfinder */}
                            <div className="relative flex aspect-square w-[64%] items-center justify-center rounded-[2rem] bg-neutral-950">
                                <span className="absolute left-4 top-4 h-7 w-7 rounded-tl-lg border-l-[3px] border-t-[3px] border-white/60" />
                                <span className="absolute right-4 top-4 h-7 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] border-white/60" />
                                <span className="absolute bottom-4 left-4 h-7 w-7 rounded-bl-lg border-b-[3px] border-l-[3px] border-white/60" />
                                <span className="absolute bottom-4 right-4 h-7 w-7 rounded-br-lg border-b-[3px] border-r-[3px] border-white/60" />

                                <div className="flex flex-col items-center gap-3">
                                    <Aperture
                                        className="text-[#E60023]"
                                        size={62}
                                        strokeWidth={1.3}
                                    />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
                                        No Signal
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#E60023]" />
                            </div>
                        </div>

                        {/* Floating recording indicator */}
                        <div className="absolute bottom-[7%] right-[3%] flex -rotate-6 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                            <span className="size-2.5 rounded-full bg-[#E60023]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                                Scene Not Found
                            </span>
                        </div>

                        {/* Small decoration */}
                        <div className="absolute left-[8%] top-[13%] size-4 rounded-full bg-[#E60023]" />
                        <div className="absolute right-[13%] bottom-[26%] size-3 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    </div>
                </div>
            </div>
        </main>
    );
}
