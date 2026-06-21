import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// Synchronous manifest reader for components. The manifest lives at
// public/og-cache/manifest.json and is produced by scripts/scrape-og-images.ts.
// We cache the JSON in module scope so 100 source rows on a page don't trigger
// 100 disk reads.

type Manifest = Record<string, string>;

let cached: Manifest | null = null;

function loadManifest(): Manifest {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "og-cache", "manifest.json");
  if (!existsSync(file)) {
    cached = {};
    return cached;
  }
  try {
    cached = JSON.parse(readFileSync(file, "utf8")) as Manifest;
  } catch {
    cached = {};
  }
  return cached;
}

export function ogHash(url: string): string {
  return createHash("sha1").update(url).digest("hex").slice(0, 16);
}

// Returns the site-absolute path of a cached og:image for a source URL, or
// null when nothing has been scraped yet.
export function ogImageFor(url: string): string | null {
  const m = loadManifest();
  return m[url] ?? null;
}
