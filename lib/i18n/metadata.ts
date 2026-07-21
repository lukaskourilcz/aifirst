import type { Metadata } from "next";
import { localePath, type Locale } from "./config";

// The canonical + hreflang + Atom-autodiscovery block for a page that exists
// in both locales. `path` is the unprefixed site path (e.g. "/" or
// "/articles/2026-05-10"); the same path is emitted for each locale so search
// engines can pair the translations. Shared by the home and article pages.
export function localeAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path),
    languages: {
      cs: localePath("cs", path),
      en: localePath("en", path),
      "x-default": localePath("en", path),
    },
    types: { "application/atom+xml": localePath(locale, "/feed.xml") },
  };
}
