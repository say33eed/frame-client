
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
    title: "Login",
    description: "Sign in to your Frame creator account.",
};

export default function LoginPage() {
    return <AuthForm mode="login" />;
}
