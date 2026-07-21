#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const manifestPath = path.join(process.cwd(), ".next", "app-build-manifest.json");
if (!fs.existsSync(manifestPath)) throw new Error("Run pnpm build before check:bundle");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { pages: Record<string, string[]> };
const budgetKb = Number(process.env.BUNDLE_BUDGET_KB ?? 110);
const rows = Object.entries(manifest.pages)
  .filter(([route]) => route.endsWith("/page"))
  .map(([route, files]) => {
    const bytes = [...new Set(files)].reduce((sum, file) => {
      if (!file.endsWith(".js")) return sum;
      const absolute = path.join(process.cwd(), ".next", file);
      return fs.existsSync(absolute) ? sum + gzipSync(fs.readFileSync(absolute), { level: 9 }).length : sum;
    }, 0);
    return { route, kb: bytes / 1024 };
  })
  .sort((a, b) => b.kb - a.kb);

const over = rows.filter((row) => row.kb > budgetKb);
const maximum = rows[0];
if (over.length) {
  console.error(`[bundle] ${over.length} route(s) exceed ${budgetKb} kB gzip:\n${over.map((row) => `  ${row.route}: ${row.kb.toFixed(1)} kB`).join("\n")}`);
  process.exit(1);
}
console.log(`[bundle] ${rows.length} page entries within ${budgetKb} kB gzip; maximum ${maximum?.route ?? "n/a"} ${maximum?.kb.toFixed(1) ?? "0.0"} kB`);
