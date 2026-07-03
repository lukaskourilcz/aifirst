import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

const BASE = "https://content.guardianapis.com/search";

type GuardianItem = {
  webTitle?: string;
  webUrl?: string;
  webPublicationDate?: string;
  fields?: { trailText?: string };
};

type GuardianSearchResponse = {
  response?: { results?: GuardianItem[] };
};

export function projectGuardian(
  data: GuardianSearchResponse,
  source: Source,
): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const item of data.response?.results ?? []) {
    if (!item.webUrl) continue;
    out.push(
      makeItem(
        item.webUrl,
        {
          title: item.webTitle,
          summary: item.fields?.trailText,
          publishedAt: item.webPublicationDate
            ? new Date(item.webPublicationDate).toISOString()
            : undefined,
        },
        source,
      ),
    );
  }
  return out;
}

export async function fetchGuardian(source: Source): Promise<ScrapedItem[]> {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) {
    console.warn(`[guardian] ${source.id}: GUARDIAN_API_KEY not set, skipping`);
    return [];
  }
  const query = source.query ?? "artificial intelligence";
  let url =
    `${BASE}?q=${encodeURIComponent(query)}&order-by=newest` +
    `&show-fields=trailText&page-size=20&api-key=${key}`;
  if (source.section) {
    url += `&section=${encodeURIComponent(source.section)}`;
  }
  try {
    const { statusCode, body } = await request(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (statusCode >= 400) {
      console.warn(`[guardian] ${source.id}: status ${statusCode}`);
      return [];
    }
    const data = (await body.json()) as GuardianSearchResponse;
    return projectGuardian(data, source);
  } catch (err) {
    console.warn(`[guardian] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
