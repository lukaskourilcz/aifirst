// Bilingual support. Czech is the default locale and renders at the
// site root (/, /archive, …); English mirrors under /en/*.
export const LOCALES = ["cs", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "cs";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Prefix a site-absolute path for a locale. The default locale (Czech)
// is unprefixed; English is served under /en.
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path;
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/en${clean}`;
}

// The opposite path for the language switcher: given the current locale
// and the current unprefixed path, produce the same page in `to`.
export function switchLocalePath(to: Locale, unprefixedPath: string): string {
  return localePath(to, unprefixedPath);
}
