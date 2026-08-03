// Czech is the only locale and renders at the site root (/, /archive, …). It used to be the
// mirror under /cs/* while English held the root; the desk publishes in Czech now, so Czech
// takes the root and every indexed URL keeps resolving. /cs/* redirects there (middleware.ts).
export const LOCALES = ["cs"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * The language a stored file is written in, which is not the same as a locale the site serves.
 *
 * Four May articles were written in English and are still in the archive. The site publishes
 * Czech only, but those files do not stop being English because of it, and deleting published
 * work to simplify a type would be the wrong trade.
 */
export const CONTENT_LANGS = ["cs", "en"] as const;
export type ContentLang = (typeof CONTENT_LANGS)[number];

export function isContentLang(value: string): value is ContentLang {
  return (CONTENT_LANGS as readonly string[]).includes(value);
}

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

// Prefix a site-absolute path for a locale. The default locale is unprefixed.
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
