import {
  listArticles,
  getArticle,
  listArticlesByTag,
  listTagsByFrequency,
} from "./content";
import { siteUrl } from "./config";
import { atomDocument, atomEntry, feedUpdated } from "./feed";
import { localePath, type Locale } from "./i18n/config";
import { dict } from "./i18n/dictionaries";

// Build the site-wide Atom feed for a locale. Czech feeds live at
// /feed.xml, English at /en/feed.xml; entries link to the same-locale
// article URLs.
export async function buildSiteFeed(locale: Locale): Promise<string> {
  const base = siteUrl();
  const summaries = await listArticles(locale);
  const entries: string[] = [];
  for (const s of summaries.slice(0, 50)) {
    const article = await getArticle(s.slug, locale);
    if (!article) continue;
    entries.push(
      atomEntry({
        title: article.frontmatter.title,
        url: `${base}${localePath(locale, `/articles/${article.slug}`)}`,
        date: article.frontmatter.date,
        summary: article.frontmatter.dek,
      }),
    );
  }

  return atomDocument({
    title: dict(locale).meta.siteTitle,
    alternateHref: `${base}${localePath(locale, "/")}`,
    selfHref: `${base}${localePath(locale, "/feed.xml")}`,
    id: `${base}${localePath(locale, "/")}`,
    updated: feedUpdated(summaries[0]?.date),
    entries,
  });
}

export async function tagFeedParams() {
  const tags = await listTagsByFrequency();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function buildTagFeed(
  locale: Locale,
  rawTag: string,
): Promise<string> {
  const tag = decodeURIComponent(rawTag);
  const base = siteUrl();
  const issues = await listArticlesByTag(tag, locale);

  const entries: string[] = [];
  for (const s of issues.slice(0, 50)) {
    const article = await getArticle(s.slug, locale);
    if (!article) continue;
    entries.push(
      atomEntry({
        title: article.frontmatter.title,
        url: `${base}${localePath(locale, `/articles/${article.slug}`)}`,
        date: article.frontmatter.date,
        summary: article.frontmatter.dek,
        category: tag,
      }),
    );
  }

  const tagPath = `/tags/${encodeURIComponent(tag)}`;
  return atomDocument({
    title: `aifirst — #${tag}`,
    alternateHref: `${base}${localePath(locale, tagPath)}`,
    selfHref: `${base}${localePath(locale, `${tagPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, tagPath)}`,
    updated: feedUpdated(issues[0]?.date),
    entries,
  });
}

const ATOM_HEADERS = {
  "content-type": "application/atom+xml; charset=utf-8",
} as const;

export function atomResponse(body: string): Response {
  return new Response(body, { headers: ATOM_HEADERS });
}
