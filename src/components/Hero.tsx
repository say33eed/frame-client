"use client";

import { homeButton } from "@/components/homeButtonStyles";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

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
    const swiperRef = useRef<SwiperType | null>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const previousSlide = () => {
        swiperRef.current?.slidePrev();
    };

    const nextSlide = () => {
        swiperRef.current?.slideNext();
    };

    const goToSlide = (index: number) => {
        swiperRef.current?.slideToLoop(index);
    };

    const pauseAutoplay = () => {
        swiperRef.current?.autoplay?.stop();
    };

    const resumeAutoplay = () => {
        swiperRef.current?.autoplay?.start();
    };

    return (
        <section
            aria-labelledby="hero-heading"
            aria-roledescription="carousel"
            className="relative flex min-h-[620px] items-center overflow-hidden bg-[#0B0B0B] text-white md:min-h-[720px]"
            onMouseEnter={pauseAutoplay}
            onMouseLeave={resumeAutoplay}
            onFocusCapture={pauseAutoplay}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    resumeAutoplay();
                }
            }}
        >
            {/* Background image slider */}
            <Swiper
                modules={[Autoplay, A11y]}
                slidesPerView={1}
                loop
                speed={1000}
                effect="slide"
                autoplay={{
                    delay: 6000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    setActiveSlide(swiper.realIndex);
                }}
                onSlideChange={(swiper) => {
                    setActiveSlide(swiper.realIndex);
                }}
                onBeforeDestroy={() => {
                    swiperRef.current = null;
                }}
                className="!absolute !inset-0 !h-full !w-full"
                aria-label="Featured creative studios"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={slide.image}>
                        <div className="relative h-full w-full">
                            <Image
                                src={slide.image}
                                alt={slide.alt}
                                fill
                                priority={index === 0}
                                sizes="100vw"
                                className="object-cover object-center"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Dark gradient overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/75 to-black/50"
                aria-hidden="true"
            />

            {/* Hero content */}
            <div className="pointer-events-none relative z-20 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
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
                        podcasts, and your creative project.
                    </p>

                    <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-4">
                        <Link
                            href="/studios"
                            className={homeButton.filled}
                        >
                            Explore Studios
                        </Link>

                        <Link
                            href="/add-studio"
                            className={homeButton.heroOutlined}
                        >
                            Host Your Space
                        </Link>
                    </div>
                </div>
            </div>

            {/* Pagination dots: left on mobile, centered on desktop */}
            <div className="absolute bottom-8 left-5 z-30 flex items-center gap-2.5 sm:left-1/2 sm:-translate-x-1/2">
                {slides.map((slide, index) => (
                    <button
                        key={slide.image}
                        type="button"
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === activeSlide ? "true" : undefined}
                        className={`h-3 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E60023] ${index === activeSlide
                                ? "w-9 bg-[#E60023]"
                                : "w-3 bg-white/60 hover:bg-white"
                            }`}
                    />
                ))}
            </div>

            {/* Navigation arrows: visible on ALL screen sizes */}
            <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 sm:right-8">
                <button
                    type="button"
                    onClick={previousSlide}
                    aria-label="Previous slide"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-black/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                >
                    <ChevronLeft size={20} aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-black/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                >
                    <ChevronRight size={20} aria-hidden="true" />
                </button>
            </div>
        </section>
    );
}
