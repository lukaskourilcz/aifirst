import { brand } from "@/lib/brand";

/** The logotype's viewBox is 4217.8 × 708, so its width follows from the height. */
const LOGO_RATIO = 4217.817852834741 / 708;

export type BrandTone = "light" | "dark" | "mono-black";

const logoSource: Record<BrandTone, string> = {
  light: brand.assets.logo,
  dark: brand.assets.logoDark,
  "mono-black": brand.assets.logoMonoBlack,
};

/**
 * The DNESKAi logotype from `public/brand/`, drawn as outlines. Light on paper,
 * `dark` on #14161A surfaces, `mono-black` for print. Never set the name in a font.
 */
export function BrandLockup({
  compact = false,
  tone = "light",
}: {
  compact?: boolean;
  tone?: BrandTone;
}) {
  const height = compact ? 18 : 20;
  return (
    <span className={compact ? "brand-lockup brand-lockup--compact" : "brand-lockup"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG needs no image optimisation */}
      <img
        src={logoSource[tone]}
        alt={brand.wordmark}
        width={Math.round(height * LOGO_RATIO)}
        height={height}
      />
    </span>
  );
}
