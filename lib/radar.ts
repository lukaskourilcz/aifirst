import { getArticle, listArticles, type ArticleSummary, type WireItem } from "./content";
import type { Locale } from "./i18n/config";

export type RadarTopic = {
  tag: string;
  recent: number;
  previous: number;
  delta: number;
};

export type RadarData = {
  generatedAt: string;
  rising: RadarTopic[];
  recurring: RadarTopic[];
  cooled: RadarTopic[];
  strongest: ArticleSummary[];
  watchlist: WireItem[];
  timeline: ArticleSummary[];
};

function tagCounts(articles: ArticleSummary[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of new Set(article.tags ?? [])) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

export function compareTopicWindows(articles: ArticleSummary[]): RadarTopic[] {
  const ordered = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const split = Math.max(1, Math.ceil(Math.min(ordered.length, 12) / 2));
  const recentCounts = tagCounts(ordered.slice(0, split));
  const previousCounts = tagCounts(ordered.slice(split, split * 2));
  return [...new Set([...recentCounts.keys(), ...previousCounts.keys()])]
    .map((tag) => {
      const recent = recentCounts.get(tag) ?? 0;
      const previous = previousCounts.get(tag) ?? 0;
      return { tag, recent, previous, delta: recent - previous };
    })
    .sort((a, b) => b.delta - a.delta || b.recent - a.recent || a.tag.localeCompare(b.tag));
}

export async function buildRadar(locale: Locale): Promise<RadarData> {
  const articles = await listArticles(locale);
  const comparison = compareTopicWindows(articles);
  const watchlist: WireItem[] = [];
  const seenUrls = new Set<string>();
  for (const summary of articles.slice(0, 6)) {
    const article = await getArticle(summary.slug, locale);
    for (const item of article?.frontmatter.wire ?? []) {
      if (seenUrls.has(item.url)) continue;
      seenUrls.add(item.url);
      watchlist.push(item);
      if (watchlist.length >= 8) break;
    }
    if (watchlist.length >= 8) break;
  }
  return {
    generatedAt: new Date().toISOString(),
    rising: comparison.filter((topic) => topic.delta > 0).slice(0, 8),
    recurring: [...comparison].sort((a, b) => b.recent - a.recent || b.previous - a.previous).filter((topic) => topic.recent + topic.previous > 1).slice(0, 8),
    cooled: comparison.filter((topic) => topic.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 8),
    strongest: [...articles].filter((article) => article.signal_strength !== undefined).sort((a, b) => (b.signal_strength ?? 0) - (a.signal_strength ?? 0)).slice(0, 5),
    watchlist,
    timeline: articles.slice(0, 10),
  };
}
