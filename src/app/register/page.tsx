
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
    title: "Create Account | Frame",
    description:
        "Create your Frame account and discover creative spaces for your next big idea.",
};

export default function RegisterPage() {
    return <AuthForm mode="register" />;
}
