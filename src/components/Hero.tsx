
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
        image: "/images/hero/hero-studio-1.jpg",
        alt: "Creative photography studio interior",
    },
    {
        image: "/images/hero/hero-studio-2.jpg",
        alt: "Film and video production studio",
    },
    {
        image: "/images/hero/hero-studio-3.jpg",
        alt: "Podcast and audio recording studio",
    },
];

export default function Hero() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % slides.length);
        }, 6000);

        return () => window.clearInterval(interval);
    }, [isPaused]);

    const previousSlide = () => {
        setActiveSlide(
            (current) => (current - 1 + slides.length) % slides.length
        );
    };

    const nextSlide = () => {
        setActiveSlide((current) => (current + 1) % slides.length);
    };

    return (
        <section
            aria-labelledby="hero-heading"
            aria-roledescription="carousel"
            className="relative flex min-h-[620px] items-center overflow-hidden bg-[#0B0B0B] text-white md:min-h-[720px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsPaused(false);
                }
            }}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.image}
                    aria-hidden={index !== activeSlide}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </div>
            ))}


            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50"
                aria-hidden="true"
            />


            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
                <div className="max-w-3xl">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/75 sm:text-sm">
                        A marketplace for creative spaces
                    </p>

                    <h1
                        id="hero-heading"
                        className="text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
                    >
                        Find your space.
                        <br />
                        Create without limits.
                    </h1>

                    <p className="mt-7 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                        Discover inspiring studios for photography, film,
                        podcasts, and your next creative project.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <Link
                            href="/studios"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F]"
                        >
                            Explore Studios
                        </Link>


                        <Link
                            href="/add-studio"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            Host Your Space
                        </Link>

                    </div>
                </div>
            </div>

            <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
                {slides.map((slide, index) => (
                    <button
                        key={slide.image}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === activeSlide ? "true" : undefined}
                        className={`h-2.5 rounded-full transition-all ${index === activeSlide
                            ? "w-9 bg-[#E60023]"
                            : "w-2.5 bg-white/60 hover:bg-white"
                            }`}
                    />
                ))}
            </div>

            <div className="absolute bottom-5 right-5 z-20 hidden items-center gap-2 sm:flex sm:right-8">
                <button
                    type="button"
                    onClick={previousSlide}
                    aria-label="Previous slide"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/20 transition-colors hover:bg-black/50"
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/20 transition-colors hover:bg-black/50"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </section>
    );
}
