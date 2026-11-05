
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeAwareToaster } from "@/components/ThemeAwareToaster";

import Navbar from "@/components/Navbar";
import ServerConnectionStatus from "@/components/ServerConnectionStatus";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import Footer from "@/components/Footer";
// import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Frame | Creative Studio Marketplace",
    template: "%s | Frame",
  },
  description:
    "Find your space. Create without limits. Discover and book inspiring studios for photography, film, podcasts, and creative projects.",
  applicationName: "Frame",
};

const themeScript = `
(function () {
    try {
        var saved = localStorage.getItem("frame-theme");
        var dark = saved === "dark" ||
            (saved !== "light" &&
             window.matchMedia("(prefers-color-scheme: dark)").matches);

        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.style.colorScheme = dark ? "dark" : "light";
    } catch (error) {
        // Use the default theme if storage is unavailable.
    }
})();
`;

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body className="flex min-h-full flex-col">
        <WishlistProvider>
          <Navbar />
          {children}
          <Footer />
        </WishlistProvider>
        <ServerConnectionStatus />
        {/* <ThemeToggle /> */}
        <ThemeAwareToaster />
      </body>
    </html>
  );
}
