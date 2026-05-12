import Parser from "rss-parser";
import type { Source, ScrapedItem } from "./types.js";
import { clampSummary, stableId, withTimeout } from "./util.js";

const parser = new Parser({ timeout: 10_000 });

export function projectRssItem(
  item: { link?: string; title?: string; contentSnippet?: string; content?: string; summary?: string; isoDate?: string; pubDate?: string },
  source: Source,
): ScrapedItem | null {
  const url = item.link ?? "";
  if (!url) return null;
  return {
    id: stableId(url),
    url,
    title: (item.title ?? "").trim(),
    summary: clampSummary(item.contentSnippet ?? item.content ?? item.summary),
    publishedAt: new Date(item.isoDate ?? item.pubDate ?? Date.now()).toISOString(),
    source: source.id,
    tags: source.tags ?? [],
  };
}

export async function parseRssFeed(xml: string, source: Source): Promise<ScrapedItem[]> {
  const feed = await parser.parseString(xml);
  const out: ScrapedItem[] = [];
  for (const item of feed.items ?? []) {
    const projected = projectRssItem(item, source);
    if (projected) out.push(projected);
  }
  return out;
}

export async function fetchRss(source: Source): Promise<ScrapedItem[]> {
  if (!source.url) {
    console.warn(`[rss] ${source.id}: missing url`);
    return [];
  }
  try {
    const feed = await withTimeout(parser.parseURL(source.url), 10_000);
    const out: ScrapedItem[] = [];
    for (const item of feed.items ?? []) {
      const projected = projectRssItem(item, source);
      if (projected) out.push(projected);
    }
    return out;
  } catch (err) {
    console.warn(`[rss] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
