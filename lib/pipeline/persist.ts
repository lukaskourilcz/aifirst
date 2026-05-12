import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { WrittenArticle } from "./write.js";

// gray-matter parses YAML via js-yaml, which still uses YAML 1.1 schema
// and so reads bare `2026-05-12` as a JS Date. Quote it on the way out
// so readers get a string everywhere.
function quoteDateScalar(yaml: string): string {
  return yaml.replace(/^date: (\d{4}-\d{2}-\d{2})$/m, 'date: "$1"');
}

export type PersistInput = {
  article: WrittenArticle;
  illustrationPath: string;
};

export async function persist({
  article,
  illustrationPath,
}: PersistInput): Promise<string> {
  const frontmatter = {
    title: article.title,
    slug: article.slug,
    date: article.date,
    dek: article.dek,
    tags: article.tags,
    sources: article.sources,
    illustration: {
      path: illustrationPath,
      prompt: article.illustrationPrompt,
      alt: article.illustrationAlt,
    },
  };
  const yaml = quoteDateScalar(YAML.stringify(frontmatter).trimEnd());
  const mdx = `---\n${yaml}\n---\n\n${article.bodyMdx.trim()}\n`;
  const dir = path.join(process.cwd(), "content", "articles");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${article.date}.mdx`);
  await fs.writeFile(file, mdx);
  return file;
}
