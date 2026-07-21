import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Serif_4, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import "./globals.css";

const d = dict(DEFAULT_LOCALE);
const vercelTelemetryEnabled = process.env.VERCEL === "1";

// Source Serif 4 stands in for Plantin (the brand serif). It's the only
// editorial typeface — used for the wordmark, headlines, body, eyebrows,
// bylines, everything that carries the magazine voice.
const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif-loaded",
});

// Inter stands in for Helvetica Neue — utility chrome only (subscribe button,
// utility bar labels). Kept narrow and functional, never editorial.
const sans = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-sans-loaded",
});

export const metadata: Metadata = {
  title: {
    default: d.meta.siteTitle,
    template: `%s · ${brand.name}`,
  },
  description: d.meta.siteDescription,
  metadataBase: new URL(siteUrl()),
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: d.meta.siteTitle,
    description: d.meta.siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: d.meta.siteTitle,
    description: d.meta.siteDescription,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        {vercelTelemetryEnabled ? <SpeedInsights /> : null}
        {vercelTelemetryEnabled ? <Analytics /> : null}
      </body>
    </html>
  );
}
