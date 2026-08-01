import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Source_Serif_4, Space_Grotesk } from "next/font/google";
import { siteUrl } from "@/lib/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import "./globals.css";

const d = dict(DEFAULT_LOCALE);

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
    <html lang={DEFAULT_LOCALE} className={`${serif.variable} ${display.variable} ${mono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
