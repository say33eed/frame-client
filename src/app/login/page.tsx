
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
    title: "Sign In | Frame",
    description:
        "Sign in to Frame to manage your creative studios, bookings, and saved spaces.",
};

export default function LoginPage() {
    return <AuthForm mode="login" />;
}
