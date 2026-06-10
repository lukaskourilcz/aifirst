import { request } from "undici";
import * as cheerio from "cheerio";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

// Generic last-resort HTML adapter. Only used when nothing else works.
// Pulls `<a>` tags inside `<article>` blocks. Configure with care.
export async function fetchHtml(source: Source): Promise<ScrapedItem[]> {
  if (!source.url) {
    console.warn(`[html] ${source.id}: missing url`);
    return [];
  }
  try {
    const { body } = await request(source.url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "user-agent": "aifirst-magazine/0.1 (+contact via repo)" },
    });
    const html = await body.text();
    const $ = cheerio.load(html);
    const out: ScrapedItem[] = [];
    $("article a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim();
      if (!href || !title || title.length < 8) return;
      const url = new URL(href, source.url!).toString();
      out.push(
        makeItem(
          url,
          { title, summary: $(el).closest("article").text() },
          source,
        ),
      );
    });
    return out.slice(0, 25);
  } catch (err) {
    console.warn(`[html] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
