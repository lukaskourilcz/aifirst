import { request } from "undici";
import * as cheerio from "cheerio";
import type { Source, ScrapedItem } from "./types.js";
import { clampSummary, stableId, withTimeout } from "./util.js";

// Generic last-resort HTML adapter. Only used when nothing else works.
// Pulls `<a>` tags inside `<article>` blocks. Configure with care.
export async function fetchHtml(source: Source): Promise<ScrapedItem[]> {
  if (!source.url) {
    console.warn(`[html] ${source.id}: missing url`);
    return [];
  }
  try {
    const { body } = await withTimeout(
      request(source.url, {
        signal: AbortSignal.timeout(10_000),
        headers: { "user-agent": "aifirst-magazine/0.1 (+contact via repo)" },
      }),
      10_000,
    );
    const html = await body.text();
    const $ = cheerio.load(html);
    const out: ScrapedItem[] = [];
    $("article a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim();
      if (!href || !title || title.length < 8) return;
      const url = new URL(href, source.url!).toString();
      out.push({
        id: stableId(url),
        url,
        title,
        summary: clampSummary($(el).closest("article").text()),
        publishedAt: new Date().toISOString(),
        source: source.id,
        tags: source.tags ?? [],
      });
    });
    return out.slice(0, 25);
  } catch (err) {
    console.warn(`[html] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
