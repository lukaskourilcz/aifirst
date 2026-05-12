import { request } from "undici";
import Parser from "rss-parser";
import type { Source, ScrapedItem } from "./types.js";
import { clampSummary, stableId, withTimeout } from "./util.js";

const parser = new Parser({ timeout: 10_000 });

export async function fetchArxiv(source: Source): Promise<ScrapedItem[]> {
  const query = source.query ?? "cat:cs.AI";
  const url =
    `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}` +
    `&sortBy=submittedDate&sortOrder=descending&max_results=25`;
  try {
    const { body } = await withTimeout(
      request(url, { signal: AbortSignal.timeout(10_000) }),
      10_000,
    );
    const xml = await body.text();
    const feed = await parser.parseString(xml);
    const out: ScrapedItem[] = [];
    for (const item of feed.items ?? []) {
      const link = item.link ?? "";
      if (!link) continue;
      out.push({
        id: stableId(link),
        url: link,
        title: (item.title ?? "").replace(/\s+/g, " ").trim(),
        summary: clampSummary(item.contentSnippet ?? item.summary),
        publishedAt: new Date(item.isoDate ?? item.pubDate ?? Date.now()).toISOString(),
        source: source.id,
        tags: source.tags ?? [],
      });
    }
    return out;
  } catch (err) {
    console.warn(`[arxiv] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
