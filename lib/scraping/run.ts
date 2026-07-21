import type { Source, ScrapedItem } from "./types.js";
import { fetchRss } from "./rss.js";
import { fetchHn } from "./hn.js";
import { fetchArxiv } from "./arxiv.js";
import { fetchHtml } from "./html.js";
import { fetchBluesky } from "./bluesky.js";
import { fetchSpaceflight } from "./spaceflight.js";
import { fetchGithub } from "./github.js";
import { fetchStackExchange } from "./stackexchange.js";
import { fetchGuardian } from "./guardian.js";
import { fetchNytimes } from "./nytimes.js";
import { fetchGnews } from "./gnews.js";

export { loadSources } from "./sources.js";

export async function fetchOne(source: Source): Promise<ScrapedItem[]> {
  switch (source.type) {
    case "rss":           return fetchRss(source);
    case "hn":            return fetchHn(source);
    case "arxiv":         return fetchArxiv(source);
    case "html":          return fetchHtml(source);
    case "bluesky":       return fetchBluesky(source);
    case "spaceflight":   return fetchSpaceflight(source);
    case "github":        return fetchGithub(source);
    case "stackexchange": return fetchStackExchange(source);
    case "guardian":      return fetchGuardian(source);
    case "nytimes":       return fetchNytimes(source);
    case "gnews":         return fetchGnews(source);
    default:
      console.warn(`[run] ${source.id}: unknown type ${source.type}`);
      return [];
  }
}

// Cap on items kept per source after fetch. Adapters often expose full
// archive feeds (HF/OpenAI blog ship 800-1000+ items in a single RSS pull);
// curate only ever picks the day's top stories so paying for the rest in
// the LLM prompt is wasted spend. Trim to the most recent N per source
// before merging.
const PER_SOURCE_CAP = 10;

export type SourceScrapeResult = {
  sourceId: string;
  status: "success" | "failed";
  candidateItems: number;
  durationMs: number;
  errorCode?: string;
  errorMessage?: string;
};

export type ScrapeRunResult = { items: ScrapedItem[]; sources: SourceScrapeResult[] };

export async function runScrapers(sources: Source[]): Promise<ScrapedItem[]> {
  return (await runScrapersDetailed(sources)).items;
}

export async function runScrapersDetailed(sources: Source[]): Promise<ScrapeRunResult> {
  const CONCURRENCY = 6;
  const queue = [...sources];
  const out: ScrapedItem[] = [];
  const results: SourceScrapeResult[] = [];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const source = queue.shift();
      if (!source) break;
      const started = Date.now();
      try {
        const items = await fetchOne(source);
        const kept = newestFirst(items).slice(0, PER_SOURCE_CAP);
        const durationMs = Date.now() - started;
        console.error(`[scrape] ${source.id}: ${items.length} fetched, kept ${kept.length} in ${durationMs}ms`);
        out.push(...kept);
        results.push({ sourceId: source.id, status: "success", candidateItems: kept.length, durationMs });
      } catch (error) {
        const durationMs = Date.now() - started;
        const errorCode = error instanceof Error ? error.name : "unknown";
        const errorMessage = error instanceof Error ? error.message.slice(0, 300) : "unknown error";
        console.error(`[scrape] ${source.id}: failed in ${durationMs}ms (${errorCode})`);
        results.push({ sourceId: source.id, status: "failed", candidateItems: 0, durationMs, errorCode, errorMessage });
      }
    }
  });
  await Promise.all(workers);
  return { items: dedupe(out), sources: results.sort((a, b) => a.sourceId.localeCompare(b.sourceId)) };
}

function newestFirst(items: ScrapedItem[]): ScrapedItem[] {
  return [...items].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );
}

function dedupe(items: ScrapedItem[]): ScrapedItem[] {
  const byUrl = new Map<string, ScrapedItem>();
  for (const item of items) {
    if (!byUrl.has(item.url)) byUrl.set(item.url, item);
  }
  return [...byUrl.values()];
}
