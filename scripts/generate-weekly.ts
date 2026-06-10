#!/usr/bin/env tsx
import fs from "node:fs/promises";
import matter from "gray-matter";
import { generateWeekly } from "../lib/pipeline/weekly.js";
import { illustrate } from "../lib/pipeline/illustrate.js";
import { toIsoDate } from "../lib/helpers/date.js";

function lastSundayUtc(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const offset = day === 0 ? 0 : day; // step back to the most recent Sunday
  d.setUTCDate(d.getUTCDate() - offset);
  return toIsoDate(d);
}

async function main() {
  const date = process.argv[2] ?? lastSundayUtc();
  console.error(`[weekly] date=${date}`);

  const files = await generateWeekly(date);
  console.error(`[weekly] wrote ${files.join(", ")}`);

  const primary = files[0];
  if (primary) {
    const raw = await fs.readFile(primary, "utf8");
    const { data } = matter(raw);
    const prompt = (data as { illustration?: { prompt?: string } }).illustration
      ?.prompt;
    if (prompt) {
      const result = await illustrate(`${date}-weekly`, prompt);
      console.error(`[weekly] illustrated -> ${result.path}`);
    }
  }

  console.log(JSON.stringify({ date, files }));
}

main().catch((err) => {
  console.error("[weekly] FAILED:", err);
  process.exit(1);
});
