#!/usr/bin/env tsx
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { request } from "undici";
import sharp from "sharp";
import { listArticles, getArticle } from "../lib/content.js";
import { fetchOgImage } from "../lib/scraping/og.js";
import { ogHash } from "../lib/og.js";

// Walks every article's `sources` and (best-effort) downloads each source's
// og:image into public/og-cache/<sha1>.webp. Writes manifest.json mapping the
// original source URL → /og-cache/<sha1>.webp so components can render the
// cached path without ever touching the network at request time.
//
// Existing entries are skipped. Pass --refresh to re-fetch everything.

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, "public", "og-cache");
const MANIFEST = path.join(CACHE_DIR, "manifest.json");
const CONCURRENCY = 4;
const REFRESH = process.argv.includes("--refresh");

async function loadManifest(): Promise<Record<string, string>> {
  if (!existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function downloadAndCompress(remoteUrl: string, dest: string): Promise<boolean> {
  try {
    const { statusCode, body, headers } = await request(remoteUrl, {
      signal: AbortSignal.timeout(10_000),
      headers: { "user-agent": "aifirst-og-bot/0.1", accept: "image/*" },
      maxRedirections: 4,
    });
    if (statusCode >= 400) return false;
    const ct = String(headers["content-type"] ?? "").toLowerCase();
    if (!ct.startsWith("image/")) return false;
    const chunks: Buffer[] = [];
    for await (const chunk of body) chunks.push(chunk as Buffer);
    const buf = Buffer.concat(chunks);
    // Resize+recompress to the post-card thumbnail dimensions. Wider crops
    // (4:3 hero) come from the same source — sharp keeps aspect so the
    // CSS `object-fit: cover` does the rest.
    const out = await sharp(buf)
      .resize({ width: 480, height: 360, fit: "cover", position: "attention" })
      .webp({ quality: 80 })
      .toBuffer();
    await fs.writeFile(dest, out);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const manifest = REFRESH ? {} : await loadManifest();

  const articles = await listArticles();
  // De-duplicate by URL across all articles. listArticles returns summaries
  // (no sources field), so we hydrate each article's frontmatter on demand.
  const sources = new Set<string>();
  for (const a of articles) {
    const art = await getArticle(a.slug, "en");
    for (const s of art?.frontmatter.sources ?? []) sources.add(s.url);
  }
  // Also collect from wire items via getArticle, but we don't have those in
  // ArticleSummary. The pipeline writes only the picked sources into
  // frontmatter, so this is the editorial set.

  const todo: string[] = [];
  for (const url of sources) {
    if (manifest[url] && !REFRESH) continue;
    todo.push(url);
  }

  console.error(`[og] ${sources.size} unique source urls; ${todo.length} to fetch`);

  let done = 0;
  let kept = Object.keys(manifest).length;
  const queue = [...todo];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const url = queue.shift();
      if (!url) break;
      done += 1;
      const remote = await fetchOgImage(url);
      if (!remote) {
        console.error(`[og] ${done}/${todo.length} miss ${url}`);
        continue;
      }
      const hash = ogHash(url);
      const dest = path.join(CACHE_DIR, `${hash}.webp`);
      const ok = await downloadAndCompress(remote, dest);
      if (!ok) {
        console.error(`[og] ${done}/${todo.length} bad image ${remote}`);
        continue;
      }
      manifest[url] = `/og-cache/${hash}.webp`;
      kept += 1;
      console.error(`[og] ${done}/${todo.length} ok ${url}`);
    }
  });
  await Promise.all(workers);

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.error(`[og] manifest written with ${kept} entries → ${MANIFEST}`);
}

main().catch((err) => {
  console.error("[og] FAILED:", err);
  process.exit(1);
});
