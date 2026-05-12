import Parser from "rss-parser";
import type { Source, ScrapedItem } from "./types.js";
import { clampSummary, stableId, withTimeout } from "./util.js";

const parser = new Parser({ timeout: 10_000 });

export async function fetchRss(source: Source): Promise<ScrapedItem[]> {
  if (!source.url) {
    console.warn(`[rss] ${source.id}: missing url`);
    return [];
  }
  try {
    const feed = await withTimeout(parser.parseURL(source.url), 10_000);
    const items: ScrapedItem[] = [];
    for (const item of feed.items ?? []) {
      const url = item.link ?? "";
      if (!url) continue;
      items.push({
        id: stableId(url),
        url,
        title: (item.title ?? "").trim(),
        summary: clampSummary(item.contentSnippet ?? item.content ?? item.summary),
        publishedAt: new Date(item.isoDate ?? item.pubDate ?? Date.now()).toISOString(),
        source: source.id,
        tags: source.tags ?? [],
      });
    }
    return items;
  } catch (err) {
    console.warn(`[rss] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
