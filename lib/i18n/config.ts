// Bilingual support. Czech is the default locale and renders at the
// site root (/, /archive, …); English mirrors under /en/*.
export const LOCALES = ["cs", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "cs";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Coerce an untrusted route/query value into a Locale, falling back to the
// default. Use this wherever a `lang` segment or `?lang=` param arrives as a
// raw string (feed routes, the print view, the locale layout).
export function resolveLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

// Prefix a site-absolute path for a locale. The default locale (Czech)
// is unprefixed; English is served under /en.
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path;
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/en${clean}`;
}

// Returns a `localePath` bound to one locale — the `lp` shorthand pages use to
// build several locale-prefixed links without repeating the locale each time.
export function localePrefixer(locale: Locale): (path: string) => string {
  return (path) => localePath(locale, path);
}
