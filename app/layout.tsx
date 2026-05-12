import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Masthead } from "@/components/Masthead";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "aifirst — a daily AI tech magazine",
  description:
    "An AI-written daily magazine covering the most interesting developments in AI and technology.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ScanlineOverlay />
        <Masthead />
        <main>{children}</main>
      </body>
    </html>
  );
}
