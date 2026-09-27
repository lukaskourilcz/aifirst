import { readFileSync } from "node:fs";
import path from "node:path";
import { brand } from "./brand";

// The logotype's viewBox is 4217.8 × 708. next/og cannot read files from
// `public/` by URL at build time, so the SVG travels as a data URL.
const LOGO_RATIO = 4217.817852834741 / 708;

export function ogLogo(height: number) {
  const svg = readFileSync(path.join(process.cwd(), "public", brand.assets.logo));
  return {
    src: `data:image/svg+xml;base64,${svg.toString("base64")}`,
    width: Math.round(height * LOGO_RATIO),
    height,
  };
}
