import type { WrittenArticle } from "./write.js";
import { computeSignalStrength } from "./signal.js";
import { loadSources } from "../scraping/sources.js";
import { writeMdxFile } from "../content-write.js";
import type { Locale } from "../i18n/config.js";
import { modelFor } from "../anthropic/models.js";
import { totalUsageCost } from "../telemetry/pricing.js";

export type PersistInput = {
  article: WrittenArticle;
  illustrationPath: string | null;
  sourceCandidates?: number;
  imageProvider?: string;
  generatedAt?: string;
};

// Writes one MDX file per locale (<date>.cs.mdx, <date>.en.mdx) sharing
// the slug, sources, illustration and signal. Returns the paths written.
export async function persist({
  article,
  illustrationPath,
  sourceCandidates,
  imageProvider,
  generatedAt,
}: PersistInput): Promise<string[]> {
  const registry = await loadSources().catch(() => []);
  const signal_strength = computeSignalStrength({
    cited: article.sources.map((s) => ({ id: s.source_id ?? s.id })),
    registry,
  });
  const resolvedImageProvider = imageProvider ?? process.env.IMAGE_PROVIDER ?? "none";
  const measuredCost = resolvedImageProvider === "fal" && illustrationPath
    ? null
    : totalUsageCost(article.usage);
  const locales = Object.keys(article.byLocale) as Locale[];

  const files: string[] = [];
  for (const locale of locales) {
    const loc = article.byLocale[locale];
    if (!loc) continue;
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
      schema_version: 2,
      title: loc.title,
      slug: article.slug,
      date: article.date,
      lang: locale,
      ...(locales.length > 1 ? { translation_of: article.slug } : {}),
      dek: loc.dek,
      alternative_headlines: loc.alternativeHeadlines,
      tags: article.tags,
      sources: article.sources,
      illustration,
      signal_strength,
      why_it_matters: loc.whyItMatters,
      what_changed: loc.whatChanged,
      uncertainty: loc.uncertainty,
      dispatches: loc.dispatches,
      wire: article.wire,
      generation: {
        generated_at: generatedAt ?? new Date().toISOString(),
        human_reviewed: false,
        models: {
          curation: modelFor("curation"),
          writing: modelFor("writing"),
        },
        source_candidates: sourceCandidates,
        cited_sources: article.sources.length,
        image_provider: resolvedImageProvider,
        ...(measuredCost ? { cost: measuredCost } : {}),
      },
    };
    files.push(
      await writeMdxFile(`${article.date}.${locale}.mdx`, frontmatter, loc.bodyMdx),
    );
  }
  return files;
}
