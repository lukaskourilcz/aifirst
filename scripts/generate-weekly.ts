#!/usr/bin/env tsx
import { generateWeekly } from "../lib/pipeline/weekly.js";
import { illustrate } from "../lib/pipeline/illustrate.js";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

function lastSundayUtc(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const offset = day === 0 ? 0 : day; // step back to most recent Sunday
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const date = process.argv[2] ?? lastSundayUtc();
  console.error(`[weekly] date=${date}`);

  const file = await generateWeekly(date);
  console.error(`[weekly] wrote ${file}`);

  // Use the illustration prompt from the written MDX to generate cover
  const raw = await fs.readFile(file, "utf8");
  const { data } = matter(raw);
  const prompt = (data as { illustration?: { prompt?: string } }).illustration
    ?.prompt;
  if (prompt) {
    const result = await illustrate(`${date}-weekly`, prompt);
    // illustrate writes to /illustrations/{date}-weekly.webp via path
    // (lib/pipeline/illustrate.ts uses the date arg as filename stem).
    console.error(`[weekly] illustrated -> ${result.path}`);
    // Note: result.path will be `/illustrations/${date}-weekly.webp`
    // matching the frontmatter we wrote. If it diverges, fix here.
    void path;
  }

  console.log(JSON.stringify({ date, file }));
}

main().catch((err) => {
  console.error("[weekly] FAILED:", err);
  process.exit(1);
});
