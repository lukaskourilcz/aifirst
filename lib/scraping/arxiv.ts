import { request } from "undici";
import Parser from "rss-parser";
import type { Source, ScrapedItem } from "./types.js";
import { projectFeedItems } from "./rss.js";

const parser = new Parser({ timeout: 10_000 });

export async function fetchArxiv(source: Source): Promise<ScrapedItem[]> {
  const query = source.query ?? "cat:cs.AI";
  const url =
    `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}` +
    `&sortBy=submittedDate&sortOrder=descending&max_results=25`;
  try {
    const { body } = await request(url, {
      signal: AbortSignal.timeout(10_000),
    });
    const feed = await parser.parseString(await body.text());
    return projectFeedItems(feed.items, source);
  } catch (err) {
    console.warn(`[arxiv] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
