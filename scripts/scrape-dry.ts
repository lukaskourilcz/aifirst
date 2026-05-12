#!/usr/bin/env tsx
import { loadSources } from "../lib/scraping/run.js";
import { fetchRss } from "../lib/scraping/rss.js";
import { fetchHn } from "../lib/scraping/hn.js";
import { fetchArxiv } from "../lib/scraping/arxiv.js";
import { fetchHtml } from "../lib/scraping/html.js";
import type { Source } from "../lib/scraping/types.js";

async function main() {
  const id = process.argv[2];
  const sources = await loadSources();
  const targets = id ? sources.filter((s) => s.id === id) : sources;
  if (id && targets.length === 0) {
    console.error(`no source with id=${id}`);
    process.exit(2);
  }
  for (const source of targets) {
    const items = await fetchOne(source);
    console.log(`\n== ${source.id} (${source.type}) — ${items.length} items ==`);
    for (const item of items.slice(0, 3)) {
      console.log(`  - ${item.title}`);
      console.log(`    ${item.url}`);
    }
  }
}

function fetchOne(source: Source) {
  switch (source.type) {
    case "rss":   return fetchRss(source);
    case "hn":    return fetchHn(source);
    case "arxiv": return fetchArxiv(source);
    case "html":  return fetchHtml(source);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
