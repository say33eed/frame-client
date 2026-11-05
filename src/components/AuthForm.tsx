
"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    ImagePlus,
    LoaderCircle,
    LockKeyhole,
    Mail,
    UserRound,
} from "lucide-react";

import {
    authClient,
    googleAuthEnabled,
} from "@/lib/auth-client";

type AuthFormProps = {
    mode: "login" | "register";
};

function getSafeRedirect(): string {
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

function getGoogleCallbackURL(): string {
    return new URL(
        getSafeRedirect(),
        window.location.origin
    ).href;
}

function GoogleIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            role="img"
            aria-label="Google"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            />
            <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.88 46.98 24.55Z"
            />
            <path
                fill="#FBBC05"
                d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
            />
            <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48Z"
            />
        </svg>
    );
}

const inputClass =
    "h-13 w-full rounded-2xl border border-neutral-200/90 " +
    "bg-neutral-50/80 pl-12 pr-4 text-[15px] text-neutral-950 " +
    "outline-none transition-colors duration-200 " +
    "placeholder:text-neutral-400 " +
    "hover:border-neutral-300 " +
    "focus:border-[#E60023] focus:bg-white " +
    "  " +
    "dark:border-white/10 dark:bg-white/[0.04] " +
    "dark:text-white dark:placeholder:text-neutral-500 " +
    "dark:hover:border-white/20 " +
    "dark:focus:border-[#E60023] " +
    "dark:focus:bg-white/[0.06] " +
    "";

const labelClass =
    "mb-2 block text-[13px] font-semibold " +
    "text-neutral-800 dark:text-neutral-200";

const iconClass =
    "pointer-events-none absolute left-4 top-1/2 " +
    "-translate-y-1/2 text-neutral-400 " +
    "dark:text-neutral-500";

export default function AuthForm({
    mode,
}: AuthFormProps) {
    const router = useRouter();
    const isRegister = mode === "register";

    const { data: session, isPending } =
        authClient.useSession();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const busy = loading || googleLoading;

    useEffect(() => {
        if (!isPending && session?.user) {
            router.replace(getSafeRedirect());
        }
    }, [isPending, session?.user, router]);

    function showAuthError(message: string) {
        const safeMessage =
            message.trim() ||
            "Something went wrong. Please try again.";

        setError(safeMessage);
        toast.error(safeMessage);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (busy || session?.user) return;

        setError("");
        setSuccess("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            showAuthError(
                "Please enter your email and password."
            );
            return;
        }

        if (isRegister) {
            if (name.trim().length < 2) {
                showAuthError(
                    "Please enter your full name."
                );
                return;
            }

            if (
                password.length < 6 ||
                !/[A-Z]/.test(password) ||
                !/[a-z]/.test(password)
            ) {
                showAuthError(
                    "Your password must contain at least 6 characters, including uppercase and lowercase letters."
                );
                return;
            }

            if (photoURL.trim()) {
                try {
                    const parsed = new URL(photoURL.trim());

                    if (
                        parsed.protocol !== "https:" &&
                        parsed.protocol !== "http:"
                    ) {
                        throw new Error("Invalid URL protocol");
                    }
                } catch {
                    showAuthError(
                        "Please enter a valid profile photo URL."
                    );
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
                    "Your account was created successfully."
                );

                toast.success(
                    "Account created! Please sign in."
                );

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

            toast.success("Welcome back to Frame!");

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
        if (
            !googleAuthEnabled ||
            busy ||
            session?.user
        ) {
            return;
        }

        setError("");
        setSuccess("");
        setGoogleLoading(true);

        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: getGoogleCallbackURL(),
            });

            if (result.error) {
                showAuthError(
                    result.error.message ||
                    "Google sign-in failed."
                );
                setGoogleLoading(false);
            }
        } catch {
            showAuthError(
                "Google sign-in is temporarily unavailable."
            );
            setGoogleLoading(false);
        }
    }

    return (
        <main className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-[#FAFAFA] px-5 py-12 sm:px-8 sm:py-16 dark:bg-[#0B0B0D]">
            {/* Subtle branded background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -right-48 -top-52 h-[450px] w-[450px] rounded-full bg-[#E60023]/[0.035] blur-3xl dark:bg-[#E60023]/[0.055]" />
                <div className="absolute -bottom-56 -left-48 h-[450px] w-[450px] rounded-full bg-neutral-300/20 blur-3xl dark:bg-white/[0.025]" />
            </div>

            <div className="mx-auto flex w-full max-w-[460px] flex-col items-center">
                <section
                    aria-labelledby="auth-heading"
                    className="w-full rounded-[30px] border border-neutral-200/70 bg-white/90 px-6 py-9 shadow-[0_16px_65px_-35px_rgba(0,0,0,0.20)] backdrop-blur-xl sm:px-10 sm:py-11 dark:border-white/10 dark:bg-[#171719]/90 dark:shadow-[0_16px_65px_-35px_rgba(0,0,0,0.65)]"
                >
                    {/* Heading */}
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E60023]/[0.07] dark:bg-[#E60023]/15">
                            {isRegister ? (
                                <UserRound
                                    size={23}
                                    strokeWidth={1.8}
                                    className="text-[#E60023]"
                                    aria-hidden="true"
                                />
                            ) : (
                                <LockKeyhole
                                    size={22}
                                    strokeWidth={1.8}
                                    className="text-[#E60023]"
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        <h1
                            id="auth-heading"
                            className="text-[29px] font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[32px] dark:text-white"
                        >
                            {isRegister
                                ? "Create your account."
                                : "Welcome back."}
                        </h1>

                        <p className="mx-auto mt-3 max-w-[315px] text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            {isRegister
                                ? "Your next creative space starts here."
                                : "Sign in to continue creating with Frame."}
                        </p>
                    </div>

                    {/* Feedback */}
                    {error && (
                        <div
                            role="alert"
                            className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="mt-7 flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                        >
                            <CheckCircle2
                                size={18}
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                            />
                            {success}
                        </div>
                    )}

                    {/* Google sign-in */}
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() =>
                                void handleGoogleSignIn()
                            }
                            disabled={
                                !googleAuthEnabled ||
                                busy ||
                                Boolean(session?.user)
                            }
                            title={
                                googleAuthEnabled
                                    ? "Continue with Google"
                                    : "Google sign-in is not configured"
                            }
                            className="flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 text-[14px] font-semibold text-neutral-900 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.055] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.09]"
                        >
                            {googleLoading ? (
                                <LoaderCircle
                                    size={20}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <GoogleIcon />
                            )}

                            Continue with Google
                        </button>

                        {!googleAuthEnabled && (
                            <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
                                Google sign-in is being configured.
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="my-7 flex items-center gap-4">
                        <div className="h-px flex-1 bg-neutral-200/80 dark:bg-white/10" />

                        <span className="shrink-0 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                            or continue with email
                        </span>

                        <div className="h-px flex-1 bg-neutral-200/80 dark:bg-white/10" />
                    </div>

                    {/* Email/password form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {isRegister && (
                            <div>
                                <label
                                    htmlFor="auth-name"
                                    className={labelClass}
                                >
                                    Full name
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className={iconClass}
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
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="auth-email"
                                className={labelClass}
                            >
                                Email address
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className={iconClass}
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
                                    placeholder="you@example.com"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="auth-password"
                                    className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200"
                                >
                                    Password
                                </label>

                                {!isRegister && (
                                    <span
                                        title="Password reset is not available yet"
                                        className="cursor-not-allowed text-xs font-medium text-neutral-400 dark:text-neutral-500"
                                    >
                                        Forgot password?
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className={iconClass}
                                    aria-hidden="true"
                                />

                                <input
                                    id="auth-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete={
                                        isRegister
                                            ? "new-password"
                                            : "current-password"
                                    }
                                    required
                                    minLength={
                                        isRegister ? 6 : undefined
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder={
                                        isRegister
                                            ? "Create a password"
                                            : "Enter your password"
                                    }
                                    className={`${inputClass} !pr-12`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((value) => !value)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={showPassword}
                                    className="group absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-200/70 focus-visible:outline-2 focus-visible:outline-[#E60023] dark:text-neutral-500 dark:hover:bg-white/10"
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            size={18}
                                            aria-hidden="true"
                                            className="transition-colors group-hover:!text-[#E60023]"
                                        />
                                    ) : (
                                        <Eye
                                            size={18}
                                            aria-hidden="true"
                                            className="transition-colors group-hover:!text-[#E60023]"
                                        />
                                    )}
                                </button>
                            </div>

                            {isRegister && (
                                <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                                    At least 6 characters, with uppercase
                                    and lowercase letters.
                                </p>
                            )}
                        </div>

                        {isRegister && (
                            <div>
                                <label
                                    htmlFor="auth-photo"
                                    className={labelClass}
                                >
                                    Profile photo URL
                                    <span className="ml-1 font-normal text-neutral-400">
                                        (optional)
                                    </span>
                                </label>

                                <div className="relative">
                                    <ImagePlus
                                        size={18}
                                        className={iconClass}
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
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Minimal Frame-branded primary button */}
                        <button
                            type="submit"
                            disabled={
                                busy || Boolean(session?.user)
                            }
                            className="group mt-2 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E60023] px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#C9001F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <LoaderCircle
                                    size={19}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <>
                                    {isRegister
                                        ? "Create account"
                                        : "Sign in"}

                                    <ArrowRight
                                        size={17}
                                        aria-hidden="true"
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch between login and register */}
                    <p className="mt-8 text-center text-[13px] text-neutral-500 dark:text-neutral-400">
                        {isRegister
                            ? "Already have an account?"
                            : "New to Frame?"}{" "}
                        <Link
                            href={
                                isRegister
                                    ? "/login"
                                    : "/register"
                            }
                            className="font-semibold text-[#E60023] underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60023]"
                        >
                            {isRegister
                                ? "Sign in"
                                : "Create an account"}
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
