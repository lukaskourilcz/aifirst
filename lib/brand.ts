import type { ContentLang, Locale } from "./i18n/config";

/**
 * The reader-facing brand.
 *
 * The name has changed twice and the internal identifiers have not, on purpose: the repository
 * is still `aifirst` and the venture is still `caught-up` in every contract, state path and
 * Actions variable. A rename that reaches identifiers invalidates sealed package hashes and
 * silently breaks settings the owner configured by hand. Only the words readers see change.
 */
export const brand = {
  name: "DNESKAi",
  legalName: "DNESKAi",
  repositoryName: "aifirst",
  title: "DNESKAi — To podstatné z AI. Každý den.",
  shortDescription: "To podstatné z AI. Každý den.",
  description:
    "Jedno vydání a máte přehled. DNESKAi vybírá a vysvětluje, co se v AI opravdu stalo — bez šumu.",
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
