import type { ContentLang, Locale } from "./i18n/config";

export const brand = {
  name: "Caught Up",
  legalName: "Caught Up",
  repositoryName: "aifirst",
  title: "Caught Up — The AI stories that actually mattered today",
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
