
"use client";

import { useParams } from "next/navigation";
import StudioForm from "@/components/studios/StudioForm";

export default function EditStudioPage() {
    const params = useParams<{ id: string }>();

    return <StudioForm key={params.id} studioId={params.id} />;
}
