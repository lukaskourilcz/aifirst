#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { readMdxFiles, type ArticleFrontmatter } from "../lib/content.js";
import { validateArticleFrontmatter, translationStructureErrors } from "../lib/editorial/validation.js";
import { loadTopicsConfig } from "../lib/topics/config.js";
import { loadSources } from "../lib/sources.js";
import { boardChangelogErrors, boardContextErrors } from "../lib/board.js";

async function main() {
  const dir = path.join(process.cwd(), "content", "articles");
  const files = await readMdxFiles(dir);
  const errors: string[] = [];
  const entries: Array<{ file: string; fm: ArticleFrontmatter }> = [];

  for (const file of files) {
    const { data, content } = matter(await fs.readFile(path.join(dir, file), "utf8"));
    errors.push(...validateArticleFrontmatter(data as Record<string, unknown>, file));
    if (!content.trim()) errors.push(`${file}: body is empty`);
    entries.push({ file, fm: data as ArticleFrontmatter });
  }
  errors.push(...translationStructureErrors(entries));

  const sourceIds = new Set((await loadSources()).map((source) => source.id));
  for (const { file, fm } of entries) {
    if (fm.schema_version !== 2) continue;
    for (const [index, source] of fm.sources.entries()) {
      if (!source.source_id || !sourceIds.has(source.source_id)) {
        errors.push(`${file}: sources[${index}].source_id must reference sources.yml`);
      }
    }
  }

  try {
    await loadTopicsConfig();
  } catch (error) {
    errors.push(`topics config: ${error instanceof Error ? error.message : "invalid"}`);
  }

  const boardDir = path.join(process.cwd(), "public", "data", "board");
  const boardFiles = await fs.readdir(boardDir).catch(() => [] as string[]);
  for (const file of boardFiles.filter((name) => name.endsWith(".json"))) {
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) {
      errors.push(`${file}: board data filename must be YYYY-MM-DD.json`);
      continue;
    }
    try {
      const value = JSON.parse(await fs.readFile(path.join(boardDir, file), "utf8")) as unknown;
      errors.push(...boardContextErrors(value, file.slice(0, 10)).map((error) => `${file}: ${error}`));
    } catch {
      errors.push(`${file}: board data must be valid JSON`);
    }
  }
  try {
    const changelog = JSON.parse(await fs.readFile(path.join(process.cwd(), "config", "board-changelog.json"), "utf8")) as unknown;
    errors.push(...boardChangelogErrors(changelog).map((error) => `board changelog: ${error}`));
  } catch {
    errors.push("board changelog: config/board-changelog.json must be valid JSON");
  }

  if (errors.length) {
    console.error(`[check] ${errors.length} issue(s) found:\n\n${errors.map((error) => `  ${error}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`[check] ${files.length} MDX file(s), ${boardFiles.length} board context file(s), and configs validated, no issues`);
}

main().catch((error) => {
  console.error("[check] FAILED:", error);
  process.exit(1);
});
