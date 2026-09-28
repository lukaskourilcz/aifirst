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
  size,
  tone = "light",
}: {
  compact?: boolean;
  /** `masthead` is the 34 px logotype centred in the site header. */
  size?: "masthead" | "footer";
  tone?: BrandTone;
}) {
  const height = size === "masthead" ? 34 : size === "footer" ? 24 : compact ? 18 : 20;
  const className = ["brand-lockup", compact ? "brand-lockup--compact" : null, size ? `brand-lockup--${size}` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={className}>
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
