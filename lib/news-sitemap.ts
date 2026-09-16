// Google News sitemap: the last two publishing days, and nothing older.
//
// Google reads at most the articles published in the last two days from a
// news sitemap and ignores the rest, so the file is small on purpose. The
// window is anchored on the newest edition's date rather than the clock:
// a build runs once per delivery and must be reproducible, which the daily
// widgets already require of everything under lib/.
import type { ArticleSummary } from "./content";
import { escapeXml, feedUpdated } from "./feed";
import { brand } from "./brand";

export const NEWS_SITEMAP_WINDOW_DAYS = 2;

/** The largest number of <url> entries Google accepts in one news sitemap. */
export const NEWS_SITEMAP_MAX_ENTRIES = 1000;

export type NewsSitemapEntry = {
  url: string;
  title: string;
  publishedAt: string;
  language: string;
};

function dayMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/** Articles published within the window ending on the newest edition's date. */
export function articlesInNewsWindow(
  summaries: readonly ArticleSummary[],
  windowDays = NEWS_SITEMAP_WINDOW_DAYS,
): ArticleSummary[] {
  const published = summaries.filter((summary) => !summary.fallback);
  const newest = published.map((summary) => summary.date).sort().at(-1);
  if (!newest) return [];
  const floor = dayMs(newest) - (windowDays - 1) * 86_400_000;
  return published
    .filter((summary) => {
      const at = dayMs(summary.date);
      return !Number.isNaN(at) && at >= floor;
    })
    .sort((left, right) => right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug))
    .slice(0, NEWS_SITEMAP_MAX_ENTRIES);
}

export function newsSitemapDocument(entries: readonly NewsSitemapEntry[]): string {
  const body = entries
    .map((entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(brand.name)}</news:name>
        <news:language>${escapeXml(entry.language)}</news:language>
      </news:publication>
      <news:publication_date>${feedUpdated(entry.publishedAt)}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`;
}
