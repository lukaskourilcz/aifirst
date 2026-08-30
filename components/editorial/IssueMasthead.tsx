import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import { isDrawnPlate, type ArticleCategory } from "@/lib/content";

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
  // Same rule as the front-page lead: the plate composites over a photograph
  // only, never over a drawn .svg cover that arrives already composed.
  const overlay = heroPhoto !== null && !isDrawnPlate(heroPhoto);
  const credit = heroAttribution
    ? <a href={heroAttribution.sourceUrl} target="_blank" rel="noopener noreferrer">
        {heroAttribution.text || `${heroAttribution.author} · ${heroAttribution.license}`}
      </a>
    : heroCaption ?? null;

  // Meta, categories and topics sit under the image on both variants; only the
  // eyebrow, headline and dek ever move onto the plate.
  const details = (
    <div className="hero__details">
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
  );

  const copy = (
    <div className="hero__copy">
      <p className="hero__eyebrow">{label}</p>
      <h1 id="issue-title" className="hero__title">{title}</h1>
      <p className="hero__dek">{dek}</p>
    </div>
  );

  if (overlay) {
    return (
      <section className="hero hero--overlay enter enter-1" aria-labelledby="issue-title">
        {/* The plate overlaps the image in normal flow, so anything rendered
            after it clears the overlap. That is why the credit is a sibling
            below the plate rather than a figcaption inside the image's box:
            a caption pinned to the image's bottom edge would sit underneath
            the plate, and the attribution has to stay fully readable. */}
        <div className="hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto}
            alt={heroAlt}
            className="hero__photo"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        {copy}
        {credit ? <p className="hero__credit">{credit}</p> : null}
        {details}
      </section>
    );
  }

  return (
    <section
      className={heroPhoto ? "hero enter enter-1" : "hero hero--no-photo enter enter-1"}
      aria-labelledby="issue-title"
    >
      {copy}
      {details}
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
          {credit ? <figcaption>{credit}</figcaption> : null}
        </figure>
      ) : null}
    </section>
  );
}
