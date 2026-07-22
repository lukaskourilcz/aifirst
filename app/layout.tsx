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

// Source Serif 4 is the editorial voice: wordmark, headlines, lead moments,
// and completion. Latin Extended keeps the Czech edition native.
const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif-loaded",
});

// Inter carries body copy, navigation, controls and reference information.
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
