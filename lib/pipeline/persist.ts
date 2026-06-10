import type { WrittenArticle } from "./write.js";
import { computeSignalStrength } from "./signal.js";
import { loadSources } from "../scraping/sources.js";
import { writeMdxFile } from "../content-write.js";

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
  return writeMdxFile(`${article.date}.mdx`, frontmatter, article.bodyMdx);
}
