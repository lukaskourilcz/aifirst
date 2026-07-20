#!/usr/bin/env tsx
import { loadSources, runScrapers } from "../lib/scraping/run.js";
import { curate } from "../lib/pipeline/curate.js";
import { write } from "../lib/pipeline/write.js";
import { illustrate } from "../lib/pipeline/illustrate.js";
import { persist } from "../lib/pipeline/persist.js";
import { promote } from "../lib/pipeline/promote.js";
import { writePromotionFile } from "../lib/promotion-store.js";
import { todayIso } from "../lib/helpers/date.js";

async function main() {
  const date = process.argv[2] ?? todayIso();
  console.error(`[generate] date=${date}`);

  const sources = await loadSources();
  console.error(`[generate] loaded ${sources.length} sources`);

  const items = await runScrapers(sources);
  console.error(`[generate] scraped ${items.length} unique items`);

  if (items.length < 10) {
    throw new Error(`too few items scraped (${items.length})`);
  }

  const itemsById = new Map(items.map((i) => [i.id, i]));

  const brief = await curate(items, date);
  console.error(
    `[generate] curated: ${brief.picks.length} picks — "${brief.headline}"`,
  );

  const article = await write(brief, itemsById);
  console.error(
    `[generate] wrote: ${article.byLocale.cs.title} (slug=${article.slug})`,
  );

  const illustration = await illustrate(date, article.illustrationPrompt);
  console.error(`[generate] illustrated: ${illustration.path}`);

  const files = await persist({ article, illustrationPath: illustration.path });
  console.error(`[generate] persisted: ${files.join(", ")}`);

  // Social promotion: derive the IG / Threads captions (cs + en) from the
  // written issue and save them for the secret /promotion page. Non-fatal —
  // the article is already on disk, so a promotion hiccup shouldn't fail the
  // whole run.
  let promotionFile: string | null = null;
  try {
    const post = await promote(article, illustration.path);
    promotionFile = await writePromotionFile(post);
    console.error(`[generate] promotion: ${promotionFile}`);
  } catch (err) {
    console.error("[generate] promotion FAILED (non-fatal):", err);
  }

  // Stdout: machine-readable summary for the GH Action.
  console.log(JSON.stringify({
    date,
    slug: article.slug,
    files,
    illustration: illustration.path,
    promotion: promotionFile,
  }));
}

main().catch((err) => {
  console.error("[generate] FAILED:", err);
  process.exit(1);
});
