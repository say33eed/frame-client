/** Shared homepage action styles. Keep the existing Frame pill design. */
export const homeButton = {
  filled:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E60023] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]",
  outlined:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-transparent px-7 text-sm font-semibold text-neutral-950 transition-colors hover:border-[#E60023] hover:bg-red-50 hover:text-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] dark:border-neutral-600 dark:text-white dark:hover:border-[#E60023] dark:hover:bg-red-950/30 dark:hover:text-white",
  heroOutlined:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/50 bg-transparent px-7 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
  text:
    "inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-neutral-950 transition-colors hover:text-[#E60023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] dark:text-white dark:hover:text-[#E60023]",
} as const;
