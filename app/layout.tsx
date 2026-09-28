import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Source_Serif_4, Space_Grotesk } from "next/font/google";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { siteUrl } from "@/lib/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import "./globals.css";

const d = dict(DEFAULT_LOCALE);

// Vercel Web Analytics, back for the November 2026 launch (issue #99): the
// marketing plan measures campaign links by `utm_source`, which Web Analytics
// reads from the page URL of the first pageview; SiteAnalytics keeps those
// parameters across the `/cs` rewrite. Cookieless, first-party
// (`/_vercel/insights/*`, already inside the CSP) and only on Vercel builds, so
// local and CI builds send nothing. The only custom event is `campaign`.
const webAnalytics = process.env.VERCEL === "1";

// Source Serif 4 carries long-form reading and descriptive editorial copy.
// Latin Extended keeps the Czech edition native.
const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif-loaded",
});

// Space Grotesk supplies the publication's technical display and interface
// hierarchy without adding client-side code.
const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display-loaded",
});

// IBM Plex Mono is reserved for machine values, navigation indices and
// evidence metadata.
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono-loaded",
});

export const metadata: Metadata = {
  title: {
    default: d.meta.siteTitle,
    template: `%s · ${brand.name}`,
  },
  description: d.meta.siteDescription,
  metadataBase: new URL(siteUrl()),
  verification: { google: "kgo4KpUqh98jk472pguPCxUfKSIzFjWXlyzA8K6ODik" },
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: d.meta.siteTitle,
    description: d.meta.siteDescription,
  },
  // Card type only: title, description and image come from each page's
  // openGraph, so an article shares its own headline rather than the site's.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} className={`${serif.variable} ${display.variable} ${mono.variable}`}>
      <body>
        {children}
        {webAnalytics ? <SiteAnalytics /> : null}
      </body>
    </html>
  );
}
