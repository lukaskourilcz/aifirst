import Link from "next/link";
import type { Article } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

export function Provenance({ article, locale }: { article: Article; locale: Locale }) {
  const t = dict(locale).article;
  const generation = article.frontmatter.generation;
  const lastCorrection = [...(article.frontmatter.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedAt = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : generation?.generated_at;
  const rows: Array<[string, string]> = [
    [t.citedSources, (generation?.cited_sources ?? article.frontmatter.sources.length).toString()],
    [t.issueType, article.frontmatter.type ?? "daily"],
    [t.language, article.lang],
    [t.measuredCost, generation?.cost
      ? `${generation.cost.amount.toFixed(4)} ${generation.cost.currency}`
      : t.costUnavailable],
  ];
  if (generation?.image_provider) rows.unshift([t.imageProvider, generation.image_provider]);
  if (generation?.source_candidates !== undefined) rows.unshift([t.sourceCandidates, generation.source_candidates.toString()]);
  if (generation) rows.unshift([t.humanReviewed, generation.human_reviewed ? t.yes : t.no]);
  if (modifiedAt) rows.unshift([t.modifiedAt, modifiedAt]);
  if (generation?.generated_at) rows.unshift([t.generatedAt, generation.generated_at]);
  const models = generation?.models;
  if (models && Object.values(models).some(Boolean)) {
    rows.splice(2, 0, [dict(locale).common.model, Object.values(models).filter(Boolean).join(", ")]);
  }

  return (
    <details className="provenance">
      <summary>{t.provenance}</summary>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <Link href={`${localePath(locale, "/about")}#methodology`}>{t.methodology} →</Link>
    </details>
  );
}
