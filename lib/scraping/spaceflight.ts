import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

const BASE = "https://api.spaceflightnewsapi.net/v4/articles/";

type SpaceflightArticle = {
  title?: string;
  url?: string;
  summary?: string;
  published_at?: string;
};

type SpaceflightSearchResponse = {
  results?: SpaceflightArticle[];
};

export function projectSpaceflight(
  data: SpaceflightSearchResponse,
  source: Source,
): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const article of data.results ?? []) {
    if (!article.url) continue;
    out.push(
      makeItem(
        article.url,
        {
          title: article.title,
          summary: article.summary,
          publishedAt: article.published_at
            ? new Date(article.published_at).toISOString()
            : undefined,
        },
        source,
      ),
    );
  }
  return out;
}

export async function fetchSpaceflight(source: Source): Promise<ScrapedItem[]> {
  const url = `${BASE}?limit=20&ordering=-published_at`;
  try {
    const { statusCode, body } = await request(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (statusCode >= 400) {
      console.warn(`[spaceflight] ${source.id}: status ${statusCode}`);
      return [];
    }
    const data = (await body.json()) as SpaceflightSearchResponse;
    return projectSpaceflight(data, source);
  } catch (err) {
    console.warn(`[spaceflight] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
