import {
  listArticles,
  getArticle,
  listArticlesByTag,
  listTagsByFrequency,
  hasRealIllustration,
} from "./content";
import type { Article } from "./content";
import { siteUrl } from "./config";
import { atomDocument, atomEntry, feedUpdated } from "./feed";
import { DEFAULT_LOCALE, localePath, type Locale } from "./i18n/config";
import { dict } from "./i18n/dictionaries";
import { brand } from "./brand";
import { articlesForTopic, loadTopicsConfig } from "./topics/config";

function correctedAt(article: Article): string {
  const correction = [...(article.frontmatter.corrections ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return correction?.date
    ?? article.frontmatter.generation?.generated_at
    ?? article.frontmatter.date;
}

function entryForArticle(article: Article, base: string, extraCategories: string[] = []): string {
  const fm = article.frontmatter;
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
    published: fm.generation?.generated_at ?? fm.date,
    updated: correctedAt(article),
    summary: fm.dek,
    categories: [...new Set([...(fm.tags ?? []), ...extraCategories])],
    language: article.lang,
    imageUrl: hasRealIllustration(fm.illustration.path) ? `${base}${fm.illustration.path}` : undefined,
    related,
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
    title: `${brand.name} — #${tag}`,
    alternateHref: `${base}${localePath(locale, tagPath)}`,
    selfHref: `${base}${localePath(locale, `${tagPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, tagPath)}`,
    updated: feedUpdated(updated.sort().at(-1) ?? issues[0]?.date),
    language: locale,
    entries,
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
    title: `${brand.name} — ${dict(locale).weekly.kicker}`,
    alternateHref: `${base}${localePath(locale, "/weekly")}`,
    selfHref: `${base}${localePath(locale, "/weekly/feed.xml")}`,
    id: `${base}${localePath(locale, "/weekly")}`,
    updated: feedUpdated(updated.sort().at(-1) ?? issues[0]?.date),
    language: locale,
    entries,
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
    title: `${brand.name} — ${topic?.title[locale] ?? slug}`,
    alternateHref: `${base}${localePath(locale, topicPath)}`,
    selfHref: `${base}${localePath(locale, `${topicPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, topicPath)}`,
    updated: feedUpdated(updated.sort().at(-1) ?? issues[0]?.date),
    language: locale,
    entries,
  });
}

const ATOM_HEADERS = {
  "content-type": "application/atom+xml; charset=utf-8",
} as const;

export function atomResponse(body: string): Response {
  return new Response(body, { headers: ATOM_HEADERS });
}
