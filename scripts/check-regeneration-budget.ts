#!/usr/bin/env tsx
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { loadEditorialConfig } from "../lib/editorial/config.js";

const execFileAsync = promisify(execFile);

async function main() {
  const date = process.env.ISSUE_DATE?.trim();
  const kind = process.env.ISSUE_KIND?.trim();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("ISSUE_DATE is required");
  if (!kind || !["daily", "weekly"].includes(kind)) throw new Error("ISSUE_KIND must be daily or weekly");
  const config = await loadEditorialConfig();
  const maximum = config.budgets.maximumRegenerationAttemptsPerDate;
  const { stdout } = await execFileAsync("git", ["log", "--all", "--format=%s", "--grep", `^regenerate\\(${kind}\\): ${date}$`]);
  const previous = stdout.split("\n").filter(Boolean).length;
  if (previous >= maximum) throw new Error(`regeneration budget exhausted for ${kind} ${date}: ${previous}/${maximum} committed attempts`);
  console.log(`regeneration budget: ${previous}/${maximum} committed attempts used for ${kind} ${date}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
