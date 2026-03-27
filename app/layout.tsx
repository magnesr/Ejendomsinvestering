import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "Boligpulsen — Smarte boligbeslutninger med data",
    template: "%s | Boligpulsen",
  },
  description:
    "Analyser boliger med investeringsscore, lejeafkast og 5-årig prognose. Planlæg din boligrejse og hold styr på din portefølje. Baseret på BBR, DST og historiske handelspriser.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://boligpulsen.dk"
  ),
  openGraph: {
    title: "Boligpulsen — Smarte boligbeslutninger med data",
    description:
      "Analyser boliger med investeringsscore, lejeafkast og prognose. Baseret på officielle danske datakilder.",
    type: "website",
    locale: "da_DK",
    siteName: "Boligpulsen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boligpulsen",
    description: "Smarte boligbeslutninger med data",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
