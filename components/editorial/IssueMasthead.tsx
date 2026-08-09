import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import type { ArticleCategory } from "@/lib/content";

// Machine keys upstream, Czech labels here. Categories are separate from tags
// and the two never merge into one row.
const CATEGORY_LABELS: Record<ArticleCategory, string> = { "ai-models": "AI modely" };
const CATEGORY_PATHS: Record<ArticleCategory, string> = { "ai-models": "/ai-modely" };

export function IssueMasthead({
  label,
  title,
  dek,
  date,
  readingMinutes,
  tags,
  categories,
  heroPhoto,
  heroAlt,
  heroCaption,
  heroAttribution,
  locale,
}: {
  label: string;
  title: string;
  dek: string;
  date: string;
  readingMinutes: number;
  tags?: string[];
  categories?: ArticleCategory[];
  heroPhoto: string | null;
  heroAlt: string;
  heroCaption?: string;
  heroAttribution?: { author: string; license: string; sourceUrl: string; text: string };
  locale: Locale;
}) {
  const t = dict(locale).common;

  return (
    <section
      className={heroPhoto ? "hero enter enter-1" : "hero hero--no-photo enter enter-1"}
      aria-labelledby="issue-title"
    >
      <div className="hero__copy">
        <p className="hero__eyebrow">{label}</p>
        <h1 id="issue-title" className="hero__title">{title}</h1>
        <p className="hero__dek">{dek}</p>
        {/* Date and reading time, and nothing else: no source count, no
            signal, no cost. */}
        <div className="hero__meta" aria-label={locale === "cs" ? "Datum a délka čtení" : "Date and reading time"}>
          <time dateTime={date}>{date}</time>
          <span aria-hidden>·</span>
          <span>{readingMinutes} {t.minutesShort} {t.readMinutes}</span>
        </div>
        {/* Absent, not empty: many editions have no category and the row simply
            does not exist for them. */}
        {categories?.length ? (
          <nav className="hero__categories" aria-label="Rubriky vydání">
            {categories.map((category) => (
              <Link key={category} href={localePath(locale, CATEGORY_PATHS[category])} className="category-chip">
                {CATEGORY_LABELS[category]}
              </Link>
            ))}
          </nav>
        ) : null}
        {tags?.length ? (
          <ul className="hero__topics" aria-label={locale === "cs" ? "Témata vydání" : "Issue topics"}>
            {tags.slice(0, 3).map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        ) : null}
      </div>
      {heroPhoto ? (
        <figure className="hero__figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto}
            alt={heroAlt}
            className="hero__photo"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          {heroAttribution ? (
            <figcaption>
              <a href={heroAttribution.sourceUrl} target="_blank" rel="noopener noreferrer">
                {heroAttribution.text || `${heroAttribution.author} · ${heroAttribution.license}`}
              </a>
            </figcaption>
          ) : heroCaption ? <figcaption>{heroCaption}</figcaption> : null}
        </figure>
      ) : null}
    </section>
  );
}
