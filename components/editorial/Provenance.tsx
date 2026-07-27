import Link from "next/link";
import type { Article } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

export function Provenance({ article, locale }: { article: Article; locale: Locale }) {
  const t = dict(locale).article;
  const common = dict(locale).common;
  const generation = article.frontmatter.generation;
  const lastCorrection = [...(article.frontmatter.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedAt = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : generation?.generated_at;
  const models = generation?.models;
  const modelList = models
    ? Object.values(models).filter(Boolean).join(", ")
    : "";
  const rows: Array<[string, string]> = [
    [t.generatedAt, generation?.generated_at ?? t.notRecorded],
    [t.modifiedAt, modifiedAt ?? t.notRecorded],
    [t.humanReviewed, generation ? (generation.human_reviewed ? t.yes : t.no) : t.notRecorded],
    [t.sourceCandidates, generation?.source_candidates?.toString() ?? t.notRecorded],
    [t.citedSources, (generation?.cited_sources ?? article.frontmatter.sources.length).toString()],
    [common.model, modelList || t.notRecorded],
    [t.imageProvider, generation?.image_provider ?? t.notRecorded],
    [t.issueType, article.frontmatter.type ?? "daily"],
    [t.language, article.lang],
    [t.measuredCost, generation?.cost
      ? `${generation.cost.amount.toFixed(4)} ${generation.cost.currency}`
      : t.costUnavailable],
  ];

  return (
    <section className="provenance" aria-labelledby="provenance-heading">
      <header className="provenance__header">
        <div>
          <p className="label label--accent">{t.provenanceKicker}</p>
          <h2 id="provenance-heading">{t.provenance}</h2>
        </div>
        <span className="provenance__schema">
          {article.frontmatter.schema_version
            ? `${t.schema} v${article.frontmatter.schema_version}`
            : t.legacyRecord}
        </span>
      </header>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <Link className="provenance__methodology" href={`${localePath(locale, "/about")}#methodology`}>
        {t.methodology} →
      </Link>
    </section>
  );
}
