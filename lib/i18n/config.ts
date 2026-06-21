// Bilingual support. English is the default locale and renders at the
// site root (/, /archive, …); Czech mirrors under /cs/*.
export const LOCALES = ["en", "cs"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Coerce an untrusted route/query value into a Locale, falling back to the
// default. Use this wherever a `lang` segment or `?lang=` param arrives as a
// raw string (feed routes, the print view, the locale layout).
export function resolveLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

// Prefix a site-absolute path for a locale. The default locale (English)
// is unprefixed; Czech is served under /cs.
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path;
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/cs${clean}`;
}

// Returns a `localePath` bound to one locale — the `lp` shorthand pages use to
// build several locale-prefixed links without repeating the locale each time.
export function localePrefixer(locale: Locale): (path: string) => string {
  return (path) => localePath(locale, path);
}
