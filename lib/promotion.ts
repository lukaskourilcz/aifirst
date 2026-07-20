import { LOCALES, type Locale } from "./i18n/config";

// The social-promotion payload derived from a daily issue. The image is shared
// across languages and platforms; only the copy changes. Surfaced on the
// secret /promotion page (direct-URL only) so the posts can be turned into IG /
// Threads content.
//
// This module is import-safe from the browser (no node built-ins) — the
// filesystem read/write helpers live in ./promotion-store.

export type PromotionPlatform = "instagram" | "threads";

export const PROMOTION_PLATFORMS: PromotionPlatform[] = ["instagram", "threads"];

// Per-language copy for one issue. `title` and `summary` are the card text;
// `instagram` / `threads` are the ready-to-paste captions, written distinctly
// for each platform (Threads leaner, fewer hashtags; IG richer, hashtag block).
export type PromotionLocaleContent = {
  title: string;
  summary: string;
  instagram: string;
  threads: string;
};

export type PromotionPost = {
  date: string;
  slug: string;
  // Public path to the shared illustration, or null when the issue has none.
  image: string | null;
  byLocale: Record<Locale, PromotionLocaleContent>;
  generated_at?: string;
};

// Runtime guard: a parsed JSON blob is a usable PromotionPost only if it has
// the shared fields and every locale's copy. Keeps the /promotion page from
// crashing on a half-written or legacy file.
export function isPromotionPost(value: unknown): value is PromotionPost {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.date !== "string" || typeof v.slug !== "string") return false;
  const byLocale = v.byLocale as Record<string, unknown> | undefined;
  if (!byLocale) return false;
  return LOCALES.every((l) => {
    const c = byLocale[l] as Record<string, unknown> | undefined;
    return (
      !!c &&
      typeof c.title === "string" &&
      typeof c.summary === "string" &&
      typeof c.instagram === "string" &&
      typeof c.threads === "string"
    );
  });
}
