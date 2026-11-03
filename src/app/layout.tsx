
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
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

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Navbar />

        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4500}
          visibleToasts={4}
        />
      </body>
    </html>
  );
}
