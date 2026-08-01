import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function IssueMasthead({
  label,
  title,
  dek,
  date,
  readingMinutes,
  tags,
  sourceCount,
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
  sourceCount: number;
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
        <div className="hero__meta" aria-label={locale === "cs" ? "Údaje o vydání" : "Issue details"}>
          <time dateTime={date}>{date}</time>
          <span aria-hidden>·</span>
          <span>{readingMinutes} {t.minutesShort} {t.readMinutes}</span>
          <span aria-hidden>·</span>
          <span>{sourceCount} {t.sources}</span>
        </div>
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
