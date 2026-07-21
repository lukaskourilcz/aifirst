#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { readMdxFiles, type ArticleFrontmatter } from "../lib/content.js";
import { validateArticleFrontmatter, translationStructureErrors } from "../lib/editorial/validation.js";
import { loadEditorialConfig } from "../lib/editorial/config.js";
import { loadTopicsConfig } from "../lib/topics/config.js";
import { loadSources } from "../lib/scraping/sources.js";

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

  for (const [name, loader] of [["editorial", loadEditorialConfig], ["topics", loadTopicsConfig]] as const) {
    try { await loader(); } catch (error) { errors.push(`${name} config: ${error instanceof Error ? error.message : "invalid"}`); }
  }

  if (errors.length) {
    console.error(`[check] ${errors.length} issue(s) found:\n\n${errors.map((error) => `  ${error}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`[check] ${files.length} MDX file(s) and editorial/topic configs validated, no issues`);
}

main().catch((error) => {
  console.error("[check] FAILED:", error);
  process.exit(1);
});
