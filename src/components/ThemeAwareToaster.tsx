"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ThemeAwareToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    const frame = requestAnimationFrame(sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  return <Toaster theme={theme} position="top-right" richColors closeButton duration={4500} visibleToasts={4} />;
}
