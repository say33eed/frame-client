
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("frame-theme");

        const initial: Theme =
            saved === "dark" || saved === "light"
                ? saved
                : window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light";

        const frame = window.requestAnimationFrame(() => {
            document.documentElement.classList.toggle(
                "dark",
                initial === "dark"
            );

            document.documentElement.style.colorScheme =
                initial;

            setTheme(initial);
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, []);

    function toggleTheme() {
        if (theme === null) return;

        const next: Theme =
            theme === "dark" ? "light" : "dark";

        document.documentElement.classList.toggle(
            "dark",
            next === "dark"
        );

        document.documentElement.style.colorScheme =
            next;

        localStorage.setItem("frame-theme", next);
        setTheme(next);
    }

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            disabled={theme === null}
            aria-label={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            title={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className="
        group inline-flex h-11 w-11 shrink-0
        items-center justify-center rounded-xl
        bg-neutral-100 text-neutral-900
        transition-colors duration-200
        hover:bg-neutral-200
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#E60023]
        disabled:cursor-not-allowed
        disabled:opacity-50
        dark:bg-neutral-800
        dark:text-white
        dark:hover:bg-neutral-700
      "
        >
            {isDark ? (
                <Sun
                    size={21}
                    aria-hidden="true"
                    className="
            text-white
            transition-colors duration-200
            group-hover:!text-[#E60023]
          "
                />
            ) : (
                <Moon
                    size={21}
                    aria-hidden="true"
                    className="
            text-neutral-900
            transition-colors duration-200
            group-hover:!text-[#E60023]
          "
                />
            )}
        </button>
    );
}
