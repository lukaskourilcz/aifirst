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
import { brand } from "./brand";
import { articlesForTopic, loadTopicsConfig } from "./topics/config";

// Build the site-wide Atom feed for a locale. English lives at /feed.xml and
// Czech under /cs/feed.xml; entries link to the same-locale
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
    title: `${brand.name} — #${tag}`,
    alternateHref: `${base}${localePath(locale, tagPath)}`,
    selfHref: `${base}${localePath(locale, `${tagPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, tagPath)}`,
    updated: feedUpdated(issues[0]?.date),
    entries,
  });
}

export async function buildWeeklyFeed(locale: Locale): Promise<string> {
  const base = siteUrl();
  const issues = (await listArticles(locale)).filter((article) => article.type === "weekly");
  const entries = issues.slice(0, 50).map((article) => atomEntry({
    title: article.title,
    url: `${base}${localePath(locale, `/articles/${article.slug}`)}`,
    date: article.date,
    summary: article.dek ?? "",
    category: "weekly",
  }));
  return atomDocument({
    title: `${brand.name} — ${dict(locale).weekly.kicker}`,
    alternateHref: `${base}${localePath(locale, "/weekly")}`,
    selfHref: `${base}${localePath(locale, "/weekly/feed.xml")}`,
    id: `${base}${localePath(locale, "/weekly")}`,
    updated: feedUpdated(issues[0]?.date),
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
  const issues = topic ? articlesForTopic(topic, all) : [];
  const entries = issues.slice(0, 50).map((article) => atomEntry({
    title: article.title,
    url: `${base}${localePath(locale, `/articles/${article.slug}`)}`,
    date: article.date,
    summary: article.dek ?? "",
    category: topic?.title[locale],
  }));
  const topicPath = `/topics/${slug}`;
  return atomDocument({
    title: `${brand.name} — ${topic?.title[locale] ?? slug}`,
    alternateHref: `${base}${localePath(locale, topicPath)}`,
    selfHref: `${base}${localePath(locale, `${topicPath}/feed.xml`)}`,
    id: `${base}${localePath(locale, topicPath)}`,
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
