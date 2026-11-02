
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export type StudioCategory = {
  name: string;
  slug: string;
};

type CategoriesResponse = {
  success: boolean;
  categories: StudioCategory[];
};

// Fallback keeps Frame usable if the backend is offline.
export const FALLBACK_STUDIO_CATEGORIES: StudioCategory[] = [
  { name: "Photo Studio", slug: "photo-studio" },
  { name: "Film Stage", slug: "film-stage" },
  { name: "Podcast Lounge", slug: "podcast-lounge" },
  { name: "Music Suite", slug: "music-suite" },
  { name: "Workshop", slug: "workshop" },
];

function isValidCategory(
  value: unknown
): value is StudioCategory {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)
  );
}

export function useStudioCategories() {
  const [categories, setCategories] = useState<
    StudioCategory[]
  >(FALLBACK_STUDIO_CATEGORIES);

  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      const result = await apiRequest<CategoriesResponse>(
        "/api/categories",
        {
          cache: "no-store",
          timeoutMs: 5000,
        }
      );

      if (!active) return;

      if (
        result.success &&
        Array.isArray(result.data.categories) &&
        result.data.categories.every(isValidCategory)
      ) {
        setCategories(result.data.categories);
        setUsingFallback(false);
      } else {
        setCategories(FALLBACK_STUDIO_CATEGORIES);
        setUsingFallback(true);
      }

      setLoading(false);
    }

    void fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  return {
    categories,
    loading,
    usingFallback,
  };
}
