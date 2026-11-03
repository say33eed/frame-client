
"use client";

import { createAuthClient } from "better-auth/react";

const apiURL = (
    (process.env.NODE_ENV === "production" ? "https://frame-client.vercel.app" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"))
).replace(/\/+$/, "");

export const authClient = createAuthClient({
    baseURL: `${apiURL}/api/auth`,
    fetchOptions: {
        credentials: "include",
    },
});

export const { signIn, signUp, signOut, useSession } = authClient;

export const googleAuthEnabled =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
