import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Masthead } from "@/components/Masthead";
import { Footer } from "@/components/Footer";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "aifirst — a daily AI tech magazine",
    template: "%s · aifirst",
  },
  description:
    "An AI-written daily magazine covering the most interesting developments in AI and technology.",
  metadataBase: new URL("https://aifirst.example"),
  openGraph: {
    type: "website",
    siteName: "aifirst",
  },
};

const THEME_INIT = `(function(){try{var m=localStorage.getItem('mode');if(m==='term')document.documentElement.dataset.mode='term';}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <ScanlineOverlay />
        <Masthead />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
