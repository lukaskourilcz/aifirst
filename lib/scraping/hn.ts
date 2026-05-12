import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { clampSummary, stableId, withTimeout } from "./util.js";

const BASE = "https://hacker-news.firebaseio.com/v0";

type HnItem = {
  id: number;
  title?: string;
  url?: string;
  text?: string;
  time?: number;
  type?: string;
};

async function getJson<T>(url: string): Promise<T> {
  const { body } = await request(url, { signal: AbortSignal.timeout(10_000) });
  return (await body.json()) as T;
}

export async function fetchHn(source: Source): Promise<ScrapedItem[]> {
  try {
    const ids = await withTimeout(getJson<number[]>(`${BASE}/topstories.json`), 10_000);
    const top = ids.slice(0, 30);
    const items = await Promise.all(
      top.map((id) => getJson<HnItem>(`${BASE}/item/${id}.json`).catch(() => null)),
    );
    const out: ScrapedItem[] = [];
    for (const item of items) {
      if (!item || item.type !== "story") continue;
      const url = item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
      out.push({
        id: stableId(url),
        url,
        title: (item.title ?? "").trim(),
        summary: clampSummary(item.text),
        publishedAt: new Date((item.time ?? 0) * 1000).toISOString(),
        source: source.id,
        tags: source.tags ?? [],
      });
    }
    return out;
  } catch (err) {
    console.warn(`[hn] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
