
import Image from "next/image";
import Link from "next/link";
import {
    ArrowUpRight,
    ImageIcon,
    MapPin,
    Star,
} from "lucide-react";

export type StudioCardData = {
    id: string;
    name: string;
    category: string;
    location: string;
    pricePerHour: number;
    currency?: string;
    imageUrl?: string;
    rating?: number;
};

type StudioCardProps = {
    studio: StudioCardData;
};

export default function StudioCard({
    studio,
}: StudioCardProps) {
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: studio.currency ?? "BDT",
        maximumFractionDigits: 0,
    }).format(studio.pricePerHour);

    return (
        <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-red-300 hover:shadow-lg dark:hover:border-red-800">
            <Link
                href={`/studios/${encodeURIComponent(studio.id)}`}
                className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    {studio.imageUrl ? (
                        <Image
                            src={studio.imageUrl}
                            alt={`${studio.name} studio`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-neutral-400">
                            <ImageIcon
                                size={36}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            {studio.category}
                        </span>

                        {studio.rating !== undefined && (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-neutral-800">
                                <Star
                                    size={14}
                                    className="fill-current"
                                    aria-hidden="true"
                                />
                                {studio.rating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-[#E60023]">
                        {studio.name}
                    </h3>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
                        <MapPin
                            size={15}
                            className="shrink-0"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {studio.location}
                        </span>
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                        <p className="text-sm text-neutral-600">
                            <span className="font-semibold text-neutral-950">
                                {formattedPrice}
                            </span>
                            {" / hour"}
                        </p>

                        <ArrowUpRight
                            size={19}
                            className="text-neutral-500 transition-colors group-hover:text-[#E60023]"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </Link>
        </article>
    );
}
