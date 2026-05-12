import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { Source, ScrapedItem } from "./types.js";
import { fetchRss } from "./rss.js";
import { fetchHn } from "./hn.js";
import { fetchArxiv } from "./arxiv.js";
import { fetchHtml } from "./html.js";

export async function loadSources(): Promise<Source[]> {
  const file = path.join(process.cwd(), "sources.yml");
  const raw = await fs.readFile(file, "utf8");
  const parsed = YAML.parse(raw) as { sources: Source[] };
  return parsed.sources;
}

async function fetchOne(source: Source): Promise<ScrapedItem[]> {
  switch (source.type) {
    case "rss":   return fetchRss(source);
    case "hn":    return fetchHn(source);
    case "arxiv": return fetchArxiv(source);
    case "html":  return fetchHtml(source);
    default:
      console.warn(`[run] ${source.id}: unknown type ${source.type}`);
      return [];
  }
}

export async function runScrapers(sources: Source[]): Promise<ScrapedItem[]> {
  const CONCURRENCY = 6;
  const queue = [...sources];
  const out: ScrapedItem[] = [];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const source = queue.shift();
      if (!source) break;
      const started = Date.now();
      const items = await fetchOne(source);
      console.error(
        `[scrape] ${source.id}: ${items.length} items in ${Date.now() - started}ms`,
      );
      out.push(...items);
    }
  });
  await Promise.all(workers);
  return dedupe(out);
}

function dedupe(items: ScrapedItem[]): ScrapedItem[] {
  const byUrl = new Map<string, ScrapedItem>();
  for (const item of items) {
    if (!byUrl.has(item.url)) byUrl.set(item.url, item);
  }
  return [...byUrl.values()];
}
