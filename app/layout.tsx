import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A clean, type-safe blog application built with Next.js 15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
