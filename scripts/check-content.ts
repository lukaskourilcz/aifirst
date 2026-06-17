#!/usr/bin/env tsx
// Validate every MDX file under content/articles/ against the
// frontmatter contract. Run in CI to keep bad commits out of main.

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { readMdxFiles } from "../lib/content.js";

type Issue = { file: string; problem: string };

function expectString(
  v: unknown,
  key: string,
  file: string,
  issues: Issue[],
): asserts v is string {
  if (typeof v !== "string" || v.trim() === "") {
    issues.push({ file, problem: `missing or non-string ${key}` });
  }
}

function expectArray(
  v: unknown,
  key: string,
  file: string,
  issues: Issue[],
): void {
  if (v !== undefined && !Array.isArray(v)) {
    issues.push({ file, problem: `${key} must be an array if present` });
  }
}

async function main() {
  const dir = path.join(process.cwd(), "content", "articles");
  const files = await readMdxFiles(dir);
  if (files.length === 0) {
    console.log("[check] no MDX files under content/articles — nothing to validate");
    return;
  }

  const issues: Issue[] = [];

  for (const file of files) {
    const abs = path.join(dir, file);
    const raw = await fs.readFile(abs, "utf8");
    const { data, content } = matter(raw);
    const fm = data as Record<string, unknown>;

    expectString(fm.title, "title", file, issues);
    expectString(fm.slug, "slug", file, issues);
    expectString(fm.dek, "dek", file, issues);

    // Date must be a string (YYYY-MM-DD), not a Date object — see
    // lib/pipeline/persist.ts for why this matters.
    if (typeof fm.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
      issues.push({
        file,
        problem:
          'date must be a quoted "YYYY-MM-DD" string; gray-matter coerces unquoted dates to Date',
      });
    }

    expectArray(fm.tags, "tags", file, issues);
    expectArray(fm.sources, "sources", file, issues);
    expectArray(fm.dispatches, "dispatches", file, issues);
    expectArray(fm.wire, "wire", file, issues);

    if (
      !fm.illustration ||
      typeof fm.illustration !== "object" ||
      typeof (fm.illustration as { path?: string }).path !== "string" ||
      typeof (fm.illustration as { prompt?: string }).prompt !== "string" ||
      typeof (fm.illustration as { alt?: string }).alt !== "string"
    ) {
      issues.push({
        file,
        problem: "illustration must have { path, prompt, alt }",
      });
    }

    if (fm.type !== undefined && fm.type !== "daily" && fm.type !== "weekly") {
      issues.push({
        file,
        problem: `type must be "daily" or "weekly" if present, got ${JSON.stringify(fm.type)}`,
      });
    }

    if (
      fm.signal_strength !== undefined &&
      (typeof fm.signal_strength !== "number" ||
        fm.signal_strength < 0 ||
        fm.signal_strength > 100)
    ) {
      issues.push({
        file,
        problem: "signal_strength must be a number between 0 and 100",
      });
    }

    // Filename should match the date prefix for sanity.
    const datePrefix =
      typeof fm.date === "string" ? fm.date : String(fm.date);
    if (!file.startsWith(datePrefix)) {
      issues.push({
        file,
        problem: `filename does not start with frontmatter date ${datePrefix}`,
      });
    }

    if (content.trim().length === 0) {
      issues.push({ file, problem: "body is empty" });
    }
  }

  if (issues.length > 0) {
    console.error(`[check] ${issues.length} issue(s) found:\n`);
    for (const issue of issues) {
      console.error(`  ${issue.file}: ${issue.problem}`);
    }
    process.exit(1);
  }

  console.log(`[check] ${files.length} MDX file(s) validated, no issues`);
}

main().catch((err) => {
  console.error("[check] FAILED:", err);
  process.exit(1);
});
