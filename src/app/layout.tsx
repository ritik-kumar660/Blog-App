import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import BannedChecker from "@/components/BannedChecker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ritik-blog.vercel.app"), // Replace with your final Vercel domain later
  title: {
    default: "Ritik Blog",
    template: "%s | Ritik Blog",
  },
  description: "Explore developer stories, technical insights, and modern web tutorials on Ritik's personal blog platform.",
  keywords: ["Next.js", "React", "Tailwind CSS", "Engineering", "Blogging", "Software Development"],
  authors: [{ name: "Ritik Kumar" }],
  creator: "Ritik Kumar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ritik-blog.vercel.app",
    siteName: "Ritik Blog",
    title: "Ritik Blog",
    description: "Insights, tutorials, and technical deep-dives on modern web development.",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "Ritik Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ritik Blog",
    description: "Insights, tutorials, and technical deep-dives on modern web development.",
    images: ["/icon.png"],
    creator: "@ritik_dev",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">

        <Providers>
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1">
            <BannedChecker>
              {children}
            </BannedChecker>
          </main>
        </Providers>

      </body>
    </html>
  );
}
