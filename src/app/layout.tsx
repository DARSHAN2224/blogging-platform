import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-User Blogging Platform",
  description: "A modern blogging platform built with Next.js 15, tRPC, and PostgreSQL",
  applicationName: "Multi-User Blogging Platform",
  metadataBase: new URL("https://blogging-platform-umber-omega.vercel.app"),
  openGraph: {
    title: "Multi-User Blogging Platform",
    description:
      "A modern blogging platform built with Next.js 15, tRPC, and PostgreSQL",
    type: "website",
    url: "/",
    siteName: "BlogPlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multi-User Blogging Platform",
    description:
      "A modern blogging platform built with Next.js 15, tRPC, and PostgreSQL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
