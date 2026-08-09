import type { ContentLang, Locale } from "./i18n/config";

export const brand = {
  name: "Caught Up",
  /**
   * The name shown in the navigation lockup.
   *
   * Held apart from `name` on purpose, so the new name can appear where readers see it
   * without moving page titles, feed metadata, structured data, the JSON endpoints or the
   * drawn covers — all of which still say Caught Up, as do the repository, the venture id
   * and the Actions variables.
   */
  wordmark: "DNESKAi",
  legalName: "Caught Up",
  repositoryName: "aifirst",
  title: "Caught Up: The AI stories that actually mattered today",
  shortDescription: "The AI stories that actually mattered today.",
  description:
    "One edition and you’re caught up on AI. Caught Up selects and explains the developments that actually mattered, without the noise.",
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
