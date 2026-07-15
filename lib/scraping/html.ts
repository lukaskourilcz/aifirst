import { request } from "undici";
import * as cheerio from "cheerio";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";
import { fetchReadable, linksFromMarkdown } from "./reader.js";

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

    // When the raw markup yields nothing (JS-rendered pages, unusual
    // structure), fall back to a reader service (Firecrawl/Jina) that returns
    // clean main-content markdown, and mine its links. No-op unless configured
    // to help — Jina is keyless, Firecrawl needs FIRECRAWL_API_KEY.
    if (out.length === 0) {
      const md = await fetchReadable(source.url);
      if (md) {
        for (const { title, url } of linksFromMarkdown(md)) {
          out.push(makeItem(url, { title, summary: "" }, source));
        }
      }
    }

    return out.slice(0, 25);
  } catch (err) {
    console.warn(`[html] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
