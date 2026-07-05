import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

const BASE = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

type NytDoc = {
  web_url?: string;
  headline?: { main?: string };
  abstract?: string;
  snippet?: string;
  pub_date?: string;
};

type NytSearchResponse = {
  response?: { docs?: NytDoc[] };
};

export function projectNytimes(
  data: NytSearchResponse,
  source: Source,
): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const doc of data.response?.docs ?? []) {
    if (!doc.web_url) continue;
    out.push(
      makeItem(
        doc.web_url,
        {
          title: doc.headline?.main,
          summary: doc.abstract || doc.snippet,
          publishedAt: doc.pub_date ? new Date(doc.pub_date).toISOString() : undefined,
        },
        source,
      ),
    );
  }
  return out;
}

export async function fetchNytimes(source: Source): Promise<ScrapedItem[]> {
  const key = process.env.NYTIMES_API_KEY;
  if (!key) {
    console.warn(`[nytimes] ${source.id}: NYTIMES_API_KEY not set, skipping`);
    return [];
  }
  const query = source.query ?? "artificial intelligence";
  const url = `${BASE}?q=${encodeURIComponent(query)}&sort=newest&api-key=${key}`;
  try {
    const { statusCode, body } = await request(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (statusCode >= 400) {
      console.warn(`[nytimes] ${source.id}: status ${statusCode}`);
      return [];
    }
    const data = (await body.json()) as NytSearchResponse;
    return projectNytimes(data, source);
  } catch (err) {
    console.warn(`[nytimes] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
