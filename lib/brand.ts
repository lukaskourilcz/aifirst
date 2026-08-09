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
  title: "DNESKAi: To podstatné z AI. Každý den.",
  shortDescription: "The AI stories that actually mattered today.",
  description:
    "One edition and you’re caught up on AI. DNESKAi selects and explains the developments that actually mattered, without the noise.",
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
