
"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    UserRound,
    ImageIcon,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";
import {
    authClient,
    googleAuthEnabled,
} from "@/lib/auth-client";

type AuthFormProps = {
    mode: "login" | "register";
};

function getSafeRedirect() {
    if (typeof window === "undefined") return "/";

    const requested = new URLSearchParams(
        window.location.search
    ).get("redirect");

    if (
        requested &&
        requested.startsWith("/") &&
        !requested.startsWith("//") &&
        !requested.includes("\\") &&
        !requested.startsWith("/login") &&
        !requested.startsWith("/register")
    ) {
        return requested;
    }

    return "/";
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const isRegister = mode === "register";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { data: session, isPending } =
        authClient.useSession();

    if (!isPending && session?.user) {
        // Navigation is scheduled outside rendering.
        Promise.resolve().then(() => {
            router.replace(getSafeRedirect());
        });
    }

    function showAuthError(message: string) {
        const safeMessage =
            message.trim() || "Something went wrong. Please try again.";

        setError(safeMessage);
        toast.error(safeMessage);
    }
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) return;

        setError("");
        setSuccess("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            showAuthError("Please enter your email and password.");
            return;
        }

        if (isRegister) {
            if (name.trim().length < 2) {
                showAuthError("Please enter your full name.");
                return;
            }

            if (
                password.length < 6 ||
                !/[A-Z]/.test(password) ||
                !/[a-z]/.test(password)
            ) {
                showAuthError(
                    "Password must be at least 6 characters and include uppercase and lowercase letters."
                );
                return;
            }

            if (photoURL.trim()) {
                try {
                    const parsed = new URL(photoURL.trim());

                    if (
                        parsed.protocol !== "http:" &&
                        parsed.protocol !== "https:"
                    ) {
                        throw new Error("Invalid protocol");
                    }
                } catch {
                    showAuthError("Please enter a valid photo URL.");
                    return;
                }
            }
        }

        setLoading(true);

        try {
            if (isRegister) {
                const result = await authClient.signUp.email({
                    name: name.trim(),
                    email: normalizedEmail,
                    password,
                    image: photoURL.trim() || undefined,
                });

                if (result.error) {
                    showAuthError(
                        result.error.message ||
                        "Registration failed. Please try again."
                    );
                    return;
                }

                setSuccess(
                    "Account created successfully. Redirecting to login..."
                );

                toast.success("Account created successfully! Please sign in.");
                router.push("/login?registered=1");
                return;
            }

            const result = await authClient.signIn.email({
                email: normalizedEmail,
                password,
            });

            if (result.error) {
                showAuthError(
                    result.error.message ||
                    "Invalid email or password."
                );
                return;
            }

            toast.success("Signed in successfully!");
            router.replace(getSafeRedirect());
            router.refresh();
        } catch {
            showAuthError(
                "Unable to connect to Frame. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        if (!googleAuthEnabled || loading) return;

        setError("");
        setLoading(true);

        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: getSafeRedirect(),
            });

            if (result.error) {
                showAuthError(
                    result.error.message || "Google sign-in failed."
                );
                setLoading(false);
            }
        } catch {
            showAuthError("Google sign-in is temporarily unavailable.");
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-50 px-5 py-16 sm:px-8">
            <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white px-7 py-10 shadow-xl shadow-neutral-950/5 sm:px-10">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                        <Image
                            src="/images/brand/frame-mark.svg"
                            alt="Frame"
                            width={38}
                            height={38}
                            className="h-10 w-10 object-contain"
                        />
                    </div>

                    <h1 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-950">
                        {isRegister ? "Join Frame" : "Creator Login"}
                    </h1>

                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
                        {isRegister
                            ? "Create your account and discover spaces made for your next big idea."
                            : "Access your studio listings, bookings, and creative workspace."}
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mt-7 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                    >
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <p
                        role="status"
                        className="mt-7 rounded-xl bg-green-50 p-3 text-sm text-green-800"
                    >
                        {success}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >
                    {isRegister && (
                        <div>
                            <label
                                htmlFor="auth-name"
                                className="mb-2 block text-sm font-semibold text-neutral-800"
                            >
                                Full Name
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                    aria-hidden="true"
                                />
                                <input
                                    id="auth-name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Your full name"
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-950 outline-none transition focus:border-[#E60023] focus:ring-2 focus:ring-red-100"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="auth-email"
                            className="mb-2 block text-sm font-semibold text-neutral-800"
                        >
                            Email Address
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                aria-hidden="true"
                            />
                            <input
                                id="auth-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="creator@example.com"
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-950 outline-none transition focus:border-[#E60023] focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    {isRegister && (
                        <div>
                            <label
                                htmlFor="auth-photo"
                                className="mb-2 block text-sm font-semibold text-neutral-800"
                            >
                                Profile Photo URL
                                <span className="ml-1 font-normal text-neutral-400">
                                    (optional)
                                </span>
                            </label>

                            <div className="relative">
                                <ImageIcon
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                    aria-hidden="true"
                                />
                                <input
                                    id="auth-photo"
                                    type="url"
                                    autoComplete="url"
                                    value={photoURL}
                                    onChange={(event) =>
                                        setPhotoURL(event.target.value)
                                    }
                                    placeholder="https://example.com/photo.jpg"
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-950 outline-none transition focus:border-[#E60023] focus:ring-2 focus:ring-red-100"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label
                                htmlFor="auth-password"
                                className="text-sm font-semibold text-neutral-800"
                            >
                                Password
                            </label>

                            {!isRegister && (
                                <span
                                    title="Password reset is not available yet"
                                    className="cursor-not-allowed text-xs font-medium text-neutral-400"
                                >
                                    Forgot Password?
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <LockKeyhole
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                aria-hidden="true"
                            />

                            <input
                                id="auth-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete={
                                    isRegister
                                        ? "new-password"
                                        : "current-password"
                                }
                                required
                                minLength={isRegister ? 6 : undefined}
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-12 text-sm text-neutral-950 outline-none transition focus:border-[#E60023] focus:ring-2 focus:ring-red-100"
                            />

                            <button
                                type="button"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                onClick={() =>
                                    setShowPassword((previous) => !previous)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} aria-hidden="true" />
                                ) : (
                                    <Eye size={18} aria-hidden="true" />
                                )}
                            </button>
                        </div>

                        {isRegister && (
                            <p className="mt-2 text-xs text-neutral-500">
                                At least 6 characters, including uppercase and
                                lowercase letters.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || Boolean(session?.user)}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E60023] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#C9001F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <>
                                {isRegister ? "Create Account" : "Sign In"}
                                <ArrowRight
                                    size={17}
                                    aria-hidden="true"
                                />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                        Or continue with
                    </span>
                    <div className="h-px flex-1 bg-neutral-200" />
                </div>

                <button
                    type="button"
                    onClick={() => void handleGoogleSignIn()}
                    disabled={!googleAuthEnabled || loading}
                    title={
                        googleAuthEnabled
                            ? "Sign in with Google"
                            : "Google sign-in will be available after configuration"
                    }
                    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span
                        className="text-lg font-bold text-[#4285F4]"
                        aria-hidden="true"
                    >
                        G
                    </span>
                    Continue with Google
                </button>

                {!googleAuthEnabled && (
                    <p className="mt-2 text-center text-xs text-neutral-400">
                        Google sign-in is being configured.
                    </p>
                )}

                <p className="mt-8 text-center text-sm text-neutral-500">
                    {isRegister
                        ? "Already have an account?"
                        : "New to Frame?"}{" "}
                    <Link
                        href={isRegister ? "/login" : "/register"}
                        className="font-semibold text-[#E60023] hover:underline"
                    >
                        {isRegister ? "Sign in" : "Create an account"}
                    </Link>
                </p>
            </div>
        </main>
    );
}
