import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

type SeQuestion = {
  title?: string;
  link?: string;
  body?: string;
  creation_date?: number;
};

type SeResponse = {
  items?: SeQuestion[];
};

export function projectQuestions(data: SeResponse, source: Source): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const question of data.items ?? []) {
    if (!question.link) continue;
    out.push(
      makeItem(
        question.link,
        {
          title: question.title,
          summary: question.body,
          publishedAt: new Date((question.creation_date ?? 0) * 1000).toISOString(),
        },
        source,
      ),
    );
  }
  return out;
}

export async function fetchStackExchange(source: Source): Promise<ScrapedItem[]> {
  const tag = source.query ?? "machine-learning";
  const site = source.site ?? "stackoverflow";
  // A free registered app key is optional but strongly recommended: the
  // anonymous API blocks datacenter IPs (CI runners, cloud) with HTTP 403,
  // and a key raises the quota. Get one at https://stackapps.com/apps/oauth/register
  const key = process.env.STACKEXCHANGE_KEY;
  const url =
    `https://api.stackexchange.com/2.3/questions?order=desc&sort=activity` +
    `&tagged=${encodeURIComponent(tag)}&site=${site}&pagesize=20&filter=withbody` +
    (key ? `&key=${encodeURIComponent(key)}` : "");
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.warn(`[stackexchange] ${source.id}: status ${res.status}`);
      return [];
    }
    const data = (await res.json()) as SeResponse;
    return projectQuestions(data, source);
  } catch (err) {
    console.warn(`[stackexchange] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
