import type { WrittenArticle } from "./write.js";
import { computeSignalStrength } from "./signal.js";
import { loadSources } from "../scraping/sources.js";
import { writeMdxFile } from "../content-write.js";
import { LOCALES } from "../i18n/config.js";

export type PersistInput = {
  article: WrittenArticle;
  illustrationPath: string | null;
};

// Writes one MDX file per locale (<date>.cs.mdx, <date>.en.mdx) sharing
// the slug, sources, illustration and signal. Returns the paths written.
export async function persist({
  article,
  illustrationPath,
}: PersistInput): Promise<string[]> {
  const registry = await loadSources().catch(() => []);
  const signal_strength = computeSignalStrength({
    cited: article.sources.map((s) => ({ id: s.id })),
    registry,
  });

  const files: string[] = [];
  for (const locale of LOCALES) {
    const loc = article.byLocale[locale];
    const illustration = illustrationPath
      ? {
          path: illustrationPath,
          prompt: article.illustrationPrompt,
          alt: loc.illustrationAlt,
        }
      : {
          prompt: article.illustrationPrompt,
          alt: loc.illustrationAlt,
        };
    const frontmatter = {
      title: loc.title,
      slug: article.slug,
      date: article.date,
      lang: locale,
      dek: loc.dek,
      tags: article.tags,
      sources: article.sources,
      illustration,
      signal_strength,
      dispatches: loc.dispatches,
      wire: article.wire,
    };
    files.push(
      await writeMdxFile(`${article.date}.${locale}.mdx`, frontmatter, loc.bodyMdx),
    );
  }
  return files;
}
