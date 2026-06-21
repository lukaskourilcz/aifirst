import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import "./globals.css";

const d = dict(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: {
    default: d.meta.siteTitle,
    template: "%s · aifirst",
  },
  description: d.meta.siteDescription,
  metadataBase: new URL(siteUrl()),
  openGraph: {
    type: "website",
    siteName: "aifirst",
  },
};

// The masthead, footer and shortcut overlay are locale-aware and live in
// app/[lang]/layout.tsx. The root layout only owns <html>/<body>, the
// pre-paint theme script, and the global scanline overlay.
const THEME_INIT = `(function(){try{var m=localStorage.getItem('mode');if(m==='dark')document.documentElement.dataset.mode='dark';}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
