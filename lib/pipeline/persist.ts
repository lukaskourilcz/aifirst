import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { WrittenArticle } from "./write.js";
import { computeSignalStrength } from "./signal.js";
import { loadSources } from "../scraping/sources.js";

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
  const registry = await loadSources().catch(() => []);
  const signal_strength = computeSignalStrength({
    cited: article.sources.map((s) => ({ id: s.id })),
    registry,
  });

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
    signal_strength,
    dispatches: article.dispatches,
    wire: article.wire,
  };
  const yaml = quoteDateScalar(YAML.stringify(frontmatter).trimEnd());
  const mdx = `---\n${yaml}\n---\n\n${article.bodyMdx.trim()}\n`;
  const dir = path.join(process.cwd(), "content", "articles");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${article.date}.mdx`);
  await fs.writeFile(file, mdx);
  return file;
}
