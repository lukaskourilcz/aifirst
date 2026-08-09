import raw from "@/config/banner.json";

// A banner slot is build-time configuration, not an ad network. There is no
// script, no third-party host and no tracking: a filled slot is a local image
// under `public/images/banners/` linked to one advertiser URL. Because the page
// is statically rendered from this config, a filled slot causes zero layout
// shift and an empty one renders nothing at all.

export type BannerCreative = { src: string; width: number; height: number };

export type BannerSlot = {
  advertiser: string;
  href: string;
  alt: string;
  desktop: BannerCreative;
  mobile: BannerCreative;
};

const LOCAL_PREFIX = "/images/banners/";

const config = raw as {
  schemaVersion: string;
  slots: Record<string, unknown>;
};

function creative(value: unknown): BannerCreative | null {
  if (typeof value !== "object" || value === null) return null;
  const { src, width, height } = value as Record<string, unknown>;
  if (typeof src !== "string" || !src.startsWith(LOCAL_PREFIX)) return null;
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

  const { active, advertiser, href, alt } = slot as Record<string, unknown>;
  if (active !== true) return null;
  if (typeof advertiser !== "string" || advertiser === "") return null;
  if (typeof href !== "string" || href === "") return null;
  if (typeof alt !== "string" || alt === "") return null;

  const desktop = creative((slot as Record<string, unknown>).desktop);
  const mobile = creative((slot as Record<string, unknown>).mobile);
  if (desktop === null || mobile === null) return null;

  return { advertiser, href, alt, desktop, mobile };
}

/** The creative configured for `id`, or `null` while the slot is empty. */
export function bannerSlot(id: string): BannerSlot | null {
  return parseSlot(config.slots[id]);
}

/**
 * Whether an empty slot still reserves its box.
 *
 * `placeholder: true` is what keeps the right rail the same height with and
 * without a creative, so filling the slot later shifts nothing. It only applies
 * while the slot is empty: once a real creative is configured the creative is
 * the reservation. Absent or false keeps the original render-null behaviour,
 * which is why `today-partner-belt` is unaffected.
 */
export function isPlaceholderSlot(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const slot = value as Record<string, unknown>;
  if (parseSlot(slot) !== null) return false;
  return slot.placeholder === true;
}

export function bannerPlaceholder(id: string): boolean {
  return isPlaceholderSlot(config.slots[id]);
}
