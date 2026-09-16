import { statSync } from "node:fs";
import path from "node:path";
import {
  listArticles,
  getArticle,
  listArticlesByTag,
  listTagsByFrequency,
  hasRealIllustration,
} from "./content";
import type { Article } from "./content";
import { siteUrl } from "./config";
import {
  NEWS_SITEMAP_MAX_ENTRIES,
  atomDocument,
  atomEntry,
  feedUpdated,
  imageMimeType,
  newsSitemapDocument,
  newsUrl,
  newsWindowStart,
  type FeedAuthor,
} from "./feed";
import { lastModifiedAt, publishedAt } from "./editorial/structured-data";
import { DEFAULT_LOCALE, localePath, type Locale } from "./i18n/config";
import { dict } from "./i18n/dictionaries";
import { brand } from "./brand";
import { articlesForTopic, loadTopicsConfig } from "./topics/config";

// Every feed speaks for the same publication, and RFC 4287 wants that said
// once at feed level rather than inferred.
function feedAuthor(): FeedAuthor {
  return { name: brand.name, uri: siteUrl() };
}

// The enclosure's byte length, when the file is one we host. A missing or
// unreadable file costs the attribute, never the entry.
function localFileSize(sitePath: string): number | undefined {
  try {
    const size = statSync(path.join(process.cwd(), "public", sitePath.replace(/^\//, ""))).size;
    return size > 0 ? size : undefined;
  } catch {
    return undefined;
  }
}

// `lastModifiedAt` is the single correction rule, shared with the article
// pages so a feed and a page can never disagree about when an edition changed.
function correctedAt(article: Article): string {
  return lastModifiedAt(article.frontmatter);
}

function entryForArticle(article: Article, base: string, extraCategories: string[] = []): string {
  const fm = article.frontmatter;
  const heroPath = hasRealIllustration(fm.illustration.path) ? fm.illustration.path : undefined;
  const heroBytes = heroPath ? localFileSize(heroPath) : undefined;
  const related = [
    ...(fm.sources ?? []).map((source) => ({
      url: source.url,
      title: `Source: ${source.publisher ?? source.title}`,
    })),
    ...(fm.sponsor ? [{ url: fm.sponsor.url, title: `Sponsored: ${fm.sponsor.name}` }] : []),
  ];
  return atomEntry({
    title: fm.title,
    url: `${base}${// One published locale, so every feed URL is the unprefixed one.
    localePath(DEFAULT_LOCALE, `/articles/${article.slug}`)}`,
    published: publishedAt(fm),
    updated: correctedAt(article),
    summary: fm.dek,
    categories: [...new Set([...(fm.tags ?? []), ...extraCategories])],
    language: article.lang,
    ...(heroPath
      ? {
          imageUrl: `${base}${heroPath}`,
          imageType: imageMimeType(heroPath),
          ...(heroBytes !== undefined ? { imageLength: heroBytes } : {}),
        }
      : {}),
    related,
    author: feedAuthor(),
  });
}

// Build the site-wide Atom feed for a locale. English lives at /feed.xml and
// Czech under /cs/feed.xml; entries link to the same-locale
// article URLs.
export async function buildSiteFeed(locale: Locale): Promise<string> {
  const base = siteUrl();
  const summaries = (await listArticles(locale)).filter((summary) => !summary.fallback);
  const entries: string[] = [];
  const updated: string[] = [];
  for (const s of summaries.slice(0, 50)) {
    const article = await getArticle(s.slug, locale);
    if (!article) continue;
    updated.push(correctedAt(article));
    entries.push(
      entryForArticle(article, base),
    );
  }

  return atomDocument({
    title: dict(locale).meta.siteTitle,
    alternateHref: `${base}${localePath(locale, "/")}`,
    selfHref: `${base}${localePath(locale, "/feed.xml")}`,
    id: `${base}${localePath(locale, "/")}`,
    updated: feedUpdated(updated.sort().at(-1) ?? summaries[0]?.date),
    language: locale,
    entries,
    author: feedAuthor(),
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
  const issues = (await listArticlesByTag(tag, locale)).filter((summary) => !summary.fallback);

  const entries: string[] = [];
  const updated: string[] = [];
  for (const s of issues.slice(0, 50)) {
    const article = await getArticle(s.slug, locale);
    if (!article) continue;
    updated.push(correctedAt(article));
    entries.push(
      entryForArticle(article, base, [tag]),
    );
  }

  const tagPath = `/tags/${encodeURIComponent(tag)}`;
  return atomDocument({
    title: `${brand.name}: #${tag}`,
    alternateHref: `${base}${localePath(locale, tagPath)}`,
    selfHref: `${base}${localePath(locale, `${tagPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, tagPath)}`,
    updated: feedUpdated(updated.sort().at(-1) ?? issues[0]?.date),
    language: locale,
    entries,
    author: feedAuthor(),
  });
}

export async function buildWeeklyFeed(locale: Locale): Promise<string> {
  const base = siteUrl();
  const issues = (await listArticles(locale)).filter((article) => article.type === "weekly" && !article.fallback);
  const entries: string[] = [];
  const updated: string[] = [];
  for (const issue of issues.slice(0, 50)) {
    const article = await getArticle(issue.slug, locale);
    if (article) {
      entries.push(entryForArticle(article, base, ["weekly"]));
      updated.push(correctedAt(article));
    }
  }
  return atomDocument({
    title: `${brand.name}: ${dict(locale).weekly.kicker}`,
    alternateHref: `${base}${localePath(locale, "/weekly")}`,
    selfHref: `${base}${localePath(locale, "/weekly/feed.xml")}`,
    id: `${base}${localePath(locale, "/weekly")}`,
    updated: feedUpdated(updated.sort().at(-1) ?? issues[0]?.date),
    language: locale,
    entries,
    author: feedAuthor(),
  });
}

export async function topicFeedParams() {
  const [config, articles] = await Promise.all([loadTopicsConfig(), listArticles()]);
  return config.topics
    .filter((topic) => topic.enabled && articlesForTopic(topic, articles).length >= config.minimumIssues)
    .map((topic) => ({ slug: topic.slug }));
}

export async function buildTopicFeed(locale: Locale, slug: string): Promise<string> {
  const base = siteUrl();
  const [config, all] = await Promise.all([loadTopicsConfig(), listArticles(locale)]);
  const topic = config.topics.find((item) => item.slug === slug && item.enabled);
  const issues = topic ? articlesForTopic(topic, all).filter((article) => !article.fallback) : [];
  const entries: string[] = [];
  const updated: string[] = [];
  for (const issue of issues.slice(0, 50)) {
    const article = await getArticle(issue.slug, locale);
    if (article) {
      entries.push(entryForArticle(article, base, topic ? [topic.title[locale]] : []));
      updated.push(correctedAt(article));
    }
  }
  const topicPath = `/topics/${slug}`;
  return atomDocument({
    title: `${brand.name}: ${topic?.title[locale] ?? slug}`,
    alternateHref: `${base}${localePath(locale, topicPath)}`,
    selfHref: `${base}${localePath(locale, `${topicPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, topicPath)}`,
    updated: feedUpdated(updated.sort().at(-1) ?? issues[0]?.date),
    language: locale,
    entries,
    author: feedAuthor(),
  });
}

/**
 * The Google News sitemap: the editions published inside the two-day window,
 * capped at the specification's 1,000 entries.
 *
 * Two decisions worth stating. The window is anchored to the newest edition's
 * own date via `newsWindowStart`, never to a clock, so the document is a pure
 * function of the committed content. And `<news:language>` is the file's own
 * language rather than the served locale, because four editions in the archive
 * are English files on a Czech-only site.
 *
 * Weekly editions live at the same `/articles/[slug]` URLs and are listed here
 * when they fall inside the window. That is deliberate: a weekly is a published
 * edition, and withholding it would be the odd choice, not including it.
 */
export async function buildNewsSitemap(locale: Locale, dir?: string): Promise<string> {
  const base = siteUrl();
  const summaries = (await listArticles(locale, dir)).filter((summary) => !summary.fallback);
  // `listArticles` sorts newest-first, so the head of the list is the anchor.
  const anchor = summaries[0]?.date;
  if (!anchor) return newsSitemapDocument([]);

  const start = newsWindowStart(anchor);
  const recent = summaries.filter((summary) => summary.date >= start).slice(0, NEWS_SITEMAP_MAX_ENTRIES);
  const urls: string[] = [];
  for (const summary of recent) {
    const article = await getArticle(summary.slug, locale, dir);
    if (!article) continue;
    urls.push(
      newsUrl({
        url: `${base}${localePath(DEFAULT_LOCALE, `/articles/${article.slug}`)}`,
        title: article.frontmatter.title,
        published: publishedAt(article.frontmatter),
        language: article.lang,
        publication: brand.name,
      }),
    );
  }
  return newsSitemapDocument(urls);
}

const ATOM_HEADERS = {
  "content-type": "application/atom+xml; charset=utf-8",
} as const;

export function atomResponse(body: string): Response {
  return new Response(body, { headers: ATOM_HEADERS });
}

const XML_HEADERS = {
  "content-type": "application/xml; charset=utf-8",
} as const;

/** For XML documents that are not Atom feeds, such as the news sitemap. */
export function xmlResponse(body: string): Response {
  return new Response(body, { headers: XML_HEADERS });
}
