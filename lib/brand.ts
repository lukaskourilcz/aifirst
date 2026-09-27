import type { ContentLang, Locale } from "./i18n/config";

export const brand = {
  /**
   * The official name, everywhere a reader or a machine meets the publication:
   * the lockup, page titles, Open Graph, structured data, the JSON endpoints,
   * the feeds and the drawn covers.
   *
   * `name` and `wordmark` used to differ on purpose, so the new name could
   * reach readers without renaming every indexed title at once. The owner
   * approved the unification on 2026-08-09, so they now agree. `legalName`,
   * the repository, the venture id and the Actions variables are unaffected:
   * those are stable identifiers, not the publication name.
   */
  name: "DNESKAi",
  wordmark: "DNESKAi",
  legalName: "Caught Up",
  repositoryName: "aifirst",
  /**
   * Production brand files under `public/`. Presentation material and the
   * BoardlessAI social packs take their paths from here.
   */
  assets: {
    logo: "/brand/DNESKAi-logo.svg",
    logoDark: "/brand/DNESKAi-logo-dark.svg",
    logoMonoBlack: "/brand/DNESKAi-logo-mono-black.svg",
    logoMonoWhite: "/brand/DNESKAi-logo-mono-white.svg",
    logoPng: "/brand/png/DNESKAi-logo-2000.png",
    square: "/brand/DNESKAi-square.svg",
    og: "/brand/DNESKAi-og.svg",
  },
  title: "DNESKAi: To podstatné z AI. Každý den.",
  shortDescription: "To podstatné z AI. Každý den.",
  description:
    "Jedno vydání a máte přehled. DNESKAi vybírá a vysvětluje podstatné změny v AI bez zbytečného šumu.",
  locale: {
    en: {
      tagline: "The AI stories that actually mattered today.",
      promise: "One edition and you’re caught up on AI.",
      shortPromise: "Understand what mattered. Skip the noise.",
      completion: "You’re caught up.",
    },
    cs: {
      tagline: "To podstatné z AI. Každý den.",
      promise: "Jedno vydání a máte přehled.",
      shortPromise: "Pochopte, co bylo důležité. Bez šumu.",
      completion: "Máte přehled.",
    },
  } satisfies Record<ContentLang, {
    tagline: string;
    promise: string;
    shortPromise: string;
    completion: string;
  }>,
} as const;

export function localizedBrand(locale: ContentLang) {
  return { ...brand, ...brand.locale[locale] };
}
