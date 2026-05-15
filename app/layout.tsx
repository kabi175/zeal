import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zeal 2 Up — AI-Powered Student Wellness Platform",
    template: "%s | Zeal 2 Up",
  },
  description:
    "AI-powered student counselling, psychological assessment, and behavioural evaluation platform for colleges and universities.",
  keywords: [
    "student wellness",
    "mental health",
    "counselling",
    "psychological assessment",
    "college support",
    "AI therapy",
    "student support",
  ],
  authors: [{ name: "Zeal 2 Up", url: "https://zeal2up.com" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://zeal2up.com",
    title: "Zeal 2 Up — AI-Powered Student Wellness Platform",
    description:
      "AI-powered student counselling, psychological assessment, and behavioural evaluation platform for colleges and universities.",
    siteName: "Zeal 2 Up",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeal 2 Up — AI-Powered Student Wellness Platform",
    description:
      "AI-powered student counselling, psychological assessment, and behavioural evaluation for colleges.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
