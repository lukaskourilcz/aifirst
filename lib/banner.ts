import raw from "@/config/banner.json";

// A banner slot is build-time configuration, not an ad network. There is no
// script, no third-party host and no tracking: a filled slot is a local image
// under `public/images/banners/` linked to one advertiser URL. Because the page
// is statically rendered from this config, a filled slot causes zero layout
// shift and an empty one renders nothing at all: no reader page shows an
// empty advertising box.

export type BannerCreative = { src: string; width: number; height: number };

export type BannerSlot = {
  advertiser: string;
  /** Overrides the default „Partner" label, e.g. „Vlastní projekt" for a house project. */
  label?: string;
  href: string;
  alt: string;
  desktop: BannerCreative;
  mobile: BannerCreative;
};


const config = raw as {
  schemaVersion: string;
  slots: Record<string, unknown>;
};

function creative(value: unknown): BannerCreative | null {
  if (typeof value !== "object" || value === null) return null;
  const { src, width, height } = value as Record<string, unknown>;
  if (typeof src !== "string" || !/^\/images\/banners\/[a-zA-Z0-9_-]+\.(svg|webp|png|jpe?g)$/.test(src)) return null;
  if (typeof width !== "number" || typeof height !== "number") return null;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return { src, width, height };
}

/**
 * One configured slot, or `null` when it is inactive, incomplete, or points
 * anywhere outside `public/images/banners/`. Anything malformed reads as empty
 * — a bad config never throws during render.
 */
export function parseSlot(value: unknown): BannerSlot | null {
  const slot = value;
  if (typeof slot !== "object" || slot === null) return null;

  const { active, advertiser, href, alt, label } = slot as Record<string, unknown>;
  if (active !== true) return null;
  if (typeof advertiser !== "string" || advertiser === "") return null;
  if (typeof href !== "string" || href === "") return null;
  if (typeof alt !== "string" || !alt.trim()) return null;

  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.username || url.password) return null;
  } catch { return null; }

  const desktop = creative((slot as Record<string, unknown>).desktop);
  const mobile = creative((slot as Record<string, unknown>).mobile);
  if (desktop === null || mobile === null) return null;

  return {
    advertiser,
    ...(typeof label === "string" && label.trim() ? { label: label.trim() } : {}),
    href,
    alt,
    desktop,
    mobile,
  };
}

/** The creative configured for `id`, or `null` while the slot is empty. */
export function bannerSlot(id: string): BannerSlot | null {
  return parseSlot(config.slots[id]);
}

