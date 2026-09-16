// The schema.org graph a reading surface publishes, built in one place so the
// article page, the front page and their tests agree on it.
//
// Google's Article reference asks for headline, image, datePublished,
// dateModified and a named author/publisher; Discover additionally only shows a
// large image preview when the picture is at least 1200 px wide. Both rules are
// encoded here rather than restated at every call site.

import { hasRealIllustration } from "../content";

/** Below this width Discover falls back to a thumbnail, so an image narrower than this is not offered as the Article image. */
export const LARGE_IMAGE_MIN_WIDTH = 1200;

/** Daily editions publish at 06:00 UTC; a bare date is not an RFC-3339 instant. */
const PUBLISH_TIME = "T06:00:00Z";

/** A correction is dated, not timestamped; midnight UTC is the honest reading of it. */
const CORRECTION_TIME = "T00:00:00Z";

export const BRAND_LOGO_PATH = "/brand/completion-mark.svg";

export type DatedFrontmatter = {
  date: string;
  corrections?: ReadonlyArray<{ date: string }>;
  generation?: { generated_at?: string };
};

export type IllustrationFrontmatter = {
  illustration?: { path?: string; width?: number; height?: number };
};

export type IndexableHero = {
  path: string;
  width?: number;
  height?: number;
};

function withTime(date: string, time: string): string {
  return date.includes("T") ? date : `${date}${time}`;
}

/** The publication instant: the delivered timestamp when there is one, else the edition's 06:00 UTC slot. */
export function publishedAt(fm: DatedFrontmatter): string {
  return fm.generation?.generated_at ?? withTime(fm.date, PUBLISH_TIME);
}

/**
 * `dateModified`: the newest correction wins, then the delivery timestamp, then
 * the publication slot. A corrected edition that still reported its original
 * date would be telling search engines the correction never happened.
 */
export function lastModifiedAt(fm: DatedFrontmatter): string {
  const newest = [...(fm.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (newest) return withTime(newest.date, CORRECTION_TIME);
  return publishedAt(fm);
}

/**
 * The hero an indexing crawler may be offered. Unlike `resolveHeroPhoto` this
 * never falls through to a cached source og:image: those are 480×360 thumbnails
 * of somebody else's page, which are neither ours to declare as the article
 * image nor wide enough for a large preview. An edition without a delivered
 * hero therefore ships the branded 1200×630 card instead.
 */
export function indexableHero(
  fm: IllustrationFrontmatter,
  isReal: (path?: string) => boolean = hasRealIllustration,
): IndexableHero | null {
  const path = fm.illustration?.path;
  if (!path || !isReal(path)) return null;
  const { width, height } = fm.illustration ?? {};
  return {
    path,
    ...(typeof width === "number" ? { width } : {}),
    ...(typeof height === "number" ? { height } : {}),
  };
}

function absolute(base: string, path: string): string {
  return path.startsWith("http") ? path : `${base}${path}`;
}

/**
 * The `image` value for an Article node: a full ImageObject when the delivered
 * dimensions clear the large-preview floor, a bare crawlable URL when the hero
 * is real but undimensioned (the pre-schema-v2 archive), and nothing at all
 * when there is no hero to declare.
 */
export function imageNode(
  hero: IndexableHero | null,
  base: string,
): Record<string, unknown> | string | undefined {
  if (!hero) return undefined;
  const url = absolute(base, hero.path);
  if (hero.width !== undefined && hero.height !== undefined && hero.width >= LARGE_IMAGE_MIN_WIDTH) {
    return { "@type": "ImageObject", url, width: hero.width, height: hero.height };
  }
  return url;
}

export function organizationId(base: string): string {
  return `${base}/#organization`;
}

export function organizationNode({ base, name }: { base: string; name: string }): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": organizationId(base),
    name,
    url: base,
    logo: { "@type": "ImageObject", url: absolute(base, BRAND_LOGO_PATH) },
  };
}

export function websiteNode({
  base,
  name,
  description,
  url,
  inLanguage,
}: {
  base: string;
  name: string;
  description: string;
  url: string;
  inLanguage: string;
}): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name,
    description,
    url,
    inLanguage,
    publisher: { "@id": organizationId(base) },
  };
}

export type ArticleNodeInput = {
  fm: DatedFrontmatter & { title: string; dek: string };
  base: string;
  /** Absolute canonical URL of the reading page. */
  url: string;
  inLanguage: string;
  isWeekly?: boolean;
  about?: string[];
  hero?: IndexableHero | null;
};

/**
 * A daily edition is a NewsArticle; a weekly digest is an Article, because it
 * is a review of a period rather than a report of the day.
 */
export function articleNode({
  fm,
  base,
  url,
  inLanguage,
  isWeekly = false,
  about = [],
  hero = null,
}: ArticleNodeInput): Record<string, unknown> {
  const image = imageNode(hero, base);
  return {
    "@type": isWeekly ? "Article" : "NewsArticle",
    headline: fm.title,
    description: fm.dek,
    datePublished: publishedAt(fm),
    dateModified: lastModifiedAt(fm),
    inLanguage,
    isAccessibleForFree: true,
    mainEntityOfPage: url,
    author: { "@id": organizationId(base) },
    publisher: { "@id": organizationId(base) },
    ...(about.length ? { about } : {}),
    ...(image !== undefined ? { image } : {}),
  };
}

export function breadcrumbNode(items: ReadonlyArray<{ name: string; item: string }>): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

/** The complete graph an article page emits: publisher, the article itself, and where it sits. */
export function articleGraph(
  input: ArticleNodeInput & {
    organizationName: string;
    breadcrumbs: ReadonlyArray<{ name: string; item: string }>;
  },
): Record<string, unknown> {
  const { organizationName, breadcrumbs, ...article } = input;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode({ base: article.base, name: organizationName }),
      articleNode(article),
      breadcrumbNode(breadcrumbs),
    ],
  };
}
