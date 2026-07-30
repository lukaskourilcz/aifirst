import type { ArticleFrontmatter } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { SignalStrength } from "@/components/SignalStrength";

export function PublicationData({
  frontmatter,
  locale,
}: {
  frontmatter: ArticleFrontmatter;
  locale: Locale;
}) {
  const d = dict(locale);
  const t = d.article;
  const generation = frontmatter.generation;
  const citedSources = generation?.cited_sources ?? frontmatter.sources.length;
  const sourcePath = generation?.source_candidates === undefined
    ? String(citedSources).padStart(2, "0")
    : `${String(generation.source_candidates).padStart(2, "0")} → ${String(citedSources).padStart(2, "0")}`;
  const review = generation
    ? (generation.human_reviewed ? t.yes : t.no)
    : t.notRecorded;
  const reviewTone = generation?.human_reviewed
    ? "publication-data__value publication-data__value--complete"
    : "publication-data__value publication-data__value--warning";
  const cost = generation?.cost
    ? `${generation.cost.amount.toFixed(4)} ${generation.cost.currency}`
    : t.costUnavailable;

  return (
    <section className="publication-data enter" aria-label={t.publicationData}>
      <div className="publication-data__cell">
        <span className="publication-data__label">{t.issueDate}</span>
        <time className="publication-data__value" dateTime={frontmatter.date}>
          {frontmatter.date}
        </time>
      </div>
      <div className="publication-data__cell">
        <span className="publication-data__label">
          {generation?.source_candidates === undefined ? t.citedSources : t.sourcePath}
        </span>
        <span className="publication-data__value">{sourcePath}</span>
      </div>
      <div className="publication-data__cell">
        <span className="publication-data__label">{t.humanReviewed}</span>
        <span className={reviewTone}>{review}</span>
      </div>
      <div className="publication-data__cell">
        <span className="publication-data__label">{t.measuredCost}</span>
        <span className="publication-data__value">{cost}</span>
      </div>
      {frontmatter.signal_strength !== undefined ? (
        <div className="publication-data__cell publication-data__cell--signal">
          <SignalStrength value={frontmatter.signal_strength} label={d.common.signal} />
        </div>
      ) : null}
    </section>
  );
}
