// Computes article embeddings for semantic "related issues" and writes them to
// public/data/embeddings.<locale>.json. Uses Jina's free embeddings API
// (jina-embeddings-v3). Incremental: only embeds slugs not already present, so
// each daily run costs a couple of short requests. Requires JINA_API_KEY —
// if it's unset the script is a no-op (the site falls back to tag-overlap
// related issues), so this never blocks the pipeline. Run via `pnpm embed:refresh`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { request } from "undici";
import { listArticles } from "../lib/content.js";
import { LOCALES, type Locale } from "../lib/i18n/config.js";
import type { EmbeddingStore } from "../lib/embeddings.js";

const MODEL = "jina-embeddings-v3";
const DIMENSIONS = 256; // Matryoshka truncation — plenty for ranking, keeps the file small
const BATCH = 32;

type JinaResponse = { data?: Array<{ index?: number; embedding?: number[] }> };

function fileFor(locale: Locale): string {
  return path.join(process.cwd(), "public", "data", `embeddings.${locale}.json`);
}

async function loadExisting(locale: Locale): Promise<EmbeddingStore> {
  const file = fileFor(locale);
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(await readFile(file, "utf8")) as EmbeddingStore;
  } catch {
    return {};
  }
}

// Round to 5 decimals to keep the committed JSON compact.
function trim(vec: number[]): number[] {
  return vec.map((n) => Math.round(n * 1e5) / 1e5);
}

async function embed(texts: string[], key: string): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await request("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        accept: "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        task: "text-matching",
        dimensions: DIMENSIONS,
        input: batch,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.statusCode < 200 || res.statusCode >= 300) {
      const body = await res.body.text().catch(() => "");
      throw new Error(`jina ${res.statusCode}: ${body.slice(0, 200)}`);
    }
    const data = (await res.body.json()) as JinaResponse;
    const rows = data.data ?? [];
    // Re-order by the response index to stay aligned with `batch`.
    const byIndex = new Map<number, number[]>();
    rows.forEach((r, n) => {
      if (r.embedding) byIndex.set(r.index ?? n, r.embedding);
    });
    for (let n = 0; n < batch.length; n++) {
      const vec = byIndex.get(n);
      if (!vec) throw new Error(`jina: missing embedding for batch index ${n}`);
      out.push(trim(vec));
    }
  }
  return out;
}

async function embedLocale(locale: Locale, key: string): Promise<void> {
  const articles = await listArticles(locale);
  const store = await loadExisting(locale);
  const seen = new Set(articles.map((a) => a.slug));

  // Drop embeddings for articles that no longer exist.
  for (const slug of Object.keys(store)) {
    if (!seen.has(slug)) delete store[slug];
  }

  const missing = articles.filter((a) => !store[a.slug]);
  if (missing.length === 0) {
    console.error(`[embed] ${locale}: up to date (${articles.length} articles)`);
    return;
  }

  const texts = missing.map((a) =>
    `${a.title}. ${a.dek ?? ""} ${(a.tags ?? []).join(" ")}`.trim(),
  );
  const vectors = await embed(texts, key);
  missing.forEach((a, i) => {
    const vec = vectors[i];
    if (vec) store[a.slug] = vec;
  });

  await mkdir(path.dirname(fileFor(locale)), { recursive: true });
  await writeFile(fileFor(locale), JSON.stringify(store) + "\n");
  console.error(
    `[embed] ${locale}: embedded ${missing.length} new, ${Object.keys(store).length} total`,
  );
}

async function main(): Promise<void> {
  const key = process.env.JINA_API_KEY;
  if (!key) {
    console.error("[embed] JINA_API_KEY not set — skipping (related issues fall back to tags)");
    return;
  }
  for (const locale of LOCALES) {
    try {
      await embedLocale(locale, key);
    } catch (err) {
      console.error(`[embed] ${locale}: ${(err as Error).message}`);
    }
  }
}

main().catch((err) => {
  console.error(`[embed] fatal: ${(err as Error).message}`);
  process.exitCode = 1;
});
