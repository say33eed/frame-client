import type { ReactNode } from "react";

type Variant = "cards" | "details" | "dashboard" | "form" | "home";

function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-neutral-200/80 dark:bg-neutral-800 ${className}`} />;
}

function Card() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <Bone className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-5"><Bone className="h-5 w-3/4" /><Bone className="h-4 w-1/2" /><Bone className="h-4 w-1/3" /></div>
    </div>
  );
}

function Shell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <main role="status" aria-live="polite" aria-busy="true" aria-label={`Loading ${title}`} className="w-full flex-1 bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3"><span className="h-3 w-3 animate-pulse rounded-full bg-[#E60023]" /><span className="text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400">Loading {title}…</span></div>
        {children}
      </div>
    </main>
  );
}

export default function FrameLoading({ variant = "cards", title = "studios" }: { variant?: Variant; title?: string }) {
  if (variant === "details") return <Shell title={title}><Bone className="mb-7 h-9 w-2/3 max-w-xl" /><Bone className="mb-8 h-5 w-1/3" /><div className="grid gap-5 lg:grid-cols-[2fr_1fr]"><Bone className="aspect-[16/10] w-full" /><div className="grid grid-cols-2 gap-4"><Bone className="h-full min-h-36" /><Bone className="h-full min-h-36" /><Bone className="h-full min-h-36" /><Bone className="h-full min-h-36" /></div></div><div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]"><div className="space-y-4"><Bone className="h-7 w-1/2" /><Bone className="h-4 w-full" /><Bone className="h-4 w-5/6" /><Bone className="h-4 w-2/3" /></div><Bone className="h-56 w-full" /></div></Shell>;
  if (variant === "form") return <Shell title={title}><div className="mx-auto max-w-3xl space-y-6"><Bone className="h-9 w-1/2" /><Bone className="h-5 w-2/3" /><div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800"><div className="grid gap-6 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="space-y-2"><Bone className="h-4 w-24" /><Bone className="h-12 w-full" /></div>)}</div><Bone className="mt-6 h-32 w-full" /><Bone className="mt-6 h-12 w-40" /></div></div></Shell>;
  if (variant === "dashboard") return <Shell title={title}><Bone className="mb-4 h-9 w-60" /><Bone className="mb-8 h-5 w-80 max-w-full" /><div className="space-y-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="flex items-center gap-5 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"><Bone className="h-20 w-24 shrink-0" /><div className="flex-1 space-y-3"><Bone className="h-5 w-1/2" /><Bone className="h-4 w-1/3" /></div><Bone className="hidden h-10 w-24 sm:block" /></div>)}</div></Shell>;
  if (variant === "home") return <Shell title={title}><Bone className="mb-8 h-72 w-full sm:h-96" /><Bone className="mb-6 h-8 w-52" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Card key={i} />)}</div></Shell>;
  return <Shell title={title}><Bone className="mb-4 h-9 w-64" /><Bone className="mb-8 h-5 w-96 max-w-full" /><div className="mb-8 flex flex-wrap gap-3">{Array.from({ length: 5 }, (_, i) => <Bone key={i} className="h-10 w-24 rounded-full" />)}</div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Card key={i} />)}</div></Shell>;
}
