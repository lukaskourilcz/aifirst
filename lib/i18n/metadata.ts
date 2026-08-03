import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from "./config";

// The canonical + hreflang + Atom-autodiscovery block for a page that exists
// `path` is the unprefixed site path (e.g. "/" or "/articles/2026-05-10"). With one published
// locale this emits one canonical and one hreflang, which is what a single-language site
// should say rather than advertising a translation that no longer exists.
export function localeAlternates(
  locale: Locale,
  path: string,
  availableLocales: readonly Locale[] = LOCALES,
): NonNullable<Metadata["alternates"]> {
  const available: readonly Locale[] = availableLocales.length ? availableLocales : [DEFAULT_LOCALE];
  const firstAvailable = available[0] ?? DEFAULT_LOCALE;
  const canonicalLocale: Locale = available.includes(locale) ? locale : firstAvailable;
  const languages = Object.fromEntries(
    available.map((availableLocale) => [availableLocale, localePath(availableLocale, path)]),
  );
  return {
    canonical: localePath(canonicalLocale, path),
    languages: {
      ...languages,
      "x-default": localePath(
        available.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : firstAvailable,
        path,
      ),
    },
    types: { "application/atom+xml": localePath(canonicalLocale, "/feed.xml") },
  };
}
