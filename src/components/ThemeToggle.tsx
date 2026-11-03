
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
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";

        const frame = window.requestAnimationFrame(() => {
            document.documentElement.classList.toggle(
                "dark",
                initial === "dark"
            );

            document.documentElement.style.colorScheme = initial;
            setTheme(initial);
        });

        return () => window.cancelAnimationFrame(frame);
    }, []);

    function toggleTheme() {
        const next: Theme = theme === "dark" ? "light" : "dark";

        document.documentElement.classList.toggle(
            "dark",
            next === "dark"
        );

        document.documentElement.style.colorScheme = next;
        localStorage.setItem("frame-theme", next);
        setTheme(next);
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            disabled={theme === null}
            aria-label={
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            title={
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-lg transition-all hover:scale-105 hover:border-[#E60023] hover:text-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:text-[#E60023]"
        >
            {theme === "dark" ? (
                <Sun size={21} />
            ) : (
                <Moon size={21} />
            )}
        </button>
    );
}
