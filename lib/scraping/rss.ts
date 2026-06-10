import Parser from "rss-parser";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem, withTimeout } from "./util.js";

const parser = new Parser({ timeout: 10_000 });

type RssItem = {
  link?: string;
  title?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  isoDate?: string;
  pubDate?: string;
};

export function projectRssItem(
  item: RssItem,
  source: Source,
): ScrapedItem | null {
  const url = item.link ?? "";
  if (!url) return null;
  return makeItem(
    url,
    {
      title: item.title,
      summary: item.contentSnippet ?? item.content ?? item.summary,
      publishedAt: new Date(
        item.isoDate ?? item.pubDate ?? Date.now(),
      ).toISOString(),
    },
    source,
  );
}

// Project an array of parsed feed items, dropping any without a link.
export function projectFeedItems(
  items: RssItem[] | undefined,
  source: Source,
): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const item of items ?? []) {
    const projected = projectRssItem(item, source);
    if (projected) out.push(projected);
  }
  return out;
}

export async function parseRssFeed(xml: string, source: Source): Promise<ScrapedItem[]> {
  const feed = await parser.parseString(xml);
  return projectFeedItems(feed.items, source);
}

export async function fetchRss(source: Source): Promise<ScrapedItem[]> {
  if (!source.url) {
    console.warn(`[rss] ${source.id}: missing url`);
    return [];
  }
  try {
    const feed = await withTimeout(parser.parseURL(source.url), 10_000);
    return projectFeedItems(feed.items, source);
  } catch (err) {
    console.warn(`[rss] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
