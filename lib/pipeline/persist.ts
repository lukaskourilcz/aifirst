import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { WrittenArticle } from "./write.js";

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
  const yaml = YAML.stringify(frontmatter).trimEnd();
  const mdx = `---\n${yaml}\n---\n\n${article.bodyMdx.trim()}\n`;
  const dir = path.join(process.cwd(), "content", "articles");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${article.date}.mdx`);
  await fs.writeFile(file, mdx);
  return file;
}
