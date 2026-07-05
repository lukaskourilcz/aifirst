import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

const BASE = "https://gnews.io/api/v4/search";

type GnewsArticle = {
  title?: string;
  url?: string;
  description?: string;
  content?: string;
  publishedAt?: string;
};

type GnewsSearchResponse = {
  articles?: GnewsArticle[];
};

export function projectGnews(
  data: GnewsSearchResponse,
  source: Source,
): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const article of data.articles ?? []) {
    if (!article.url) continue;
    out.push(
      makeItem(
        article.url,
        {
          title: article.title,
          summary: article.description,
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toISOString()
            : undefined,
        },
        source,
      ),
    );
  }
  return out;
}

export async function fetchGnews(source: Source): Promise<ScrapedItem[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    console.warn(`[gnews] ${source.id}: GNEWS_API_KEY not set, skipping`);
    return [];
  }
  const query = source.query ?? "artificial intelligence";
  // Free tier caps results at 10 per search; asking for more is silently
  // truncated, so request exactly what the free plan returns.
  const url = `${BASE}?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${key}`;
  try {
    const { statusCode, body } = await request(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (statusCode >= 400) {
      console.warn(`[gnews] ${source.id}: status ${statusCode}`);
      return [];
    }
    const data = (await body.json()) as GnewsSearchResponse;
    return projectGnews(data, source);
  } catch (err) {
    console.warn(`[gnews] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
