import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import { isDrawnPlate } from "@/lib/content";
import { czechLongDate } from "@/lib/weeks";
import { photoCreditParts, topicLabels } from "@/lib/labels";


export function IssueMasthead({
  label,
  title,
  dek,
  date,
  tags,
  heroPhoto,
  heroAlt,
  heroCaption,
  heroAttribution,
  provenance,
  locale,
}: {
  label: string;
  title: string;
  dek: string;
  date: string;
  tags?: string[];
  heroPhoto: string | null;
  heroAlt: string;
  heroCaption?: string;
  heroAttribution?: { author: string; license: string; sourceUrl: string; text: string };
  /** The provenance sentence, already composed; absent on legacy editions. */
  provenance?: string | null;
  locale: Locale;
}) {
  const t = dict(locale).common;
  // Same rule as the front-page lead: the plate composites over a photograph
  // only, never over a drawn .svg cover that arrives already composed.
  const overlay = heroPhoto !== null && !isDrawnPlate(heroPhoto);
  // Czech labels only; a slug without one is left out rather than shown raw.
  const topics = topicLabels(tags).slice(0, 3);
  // Rebuilt from the structured fields: upstream's `text` is English. The link
  // sits on the author's name only.
  const creditParts = heroAttribution ? photoCreditParts(heroAttribution) : null;
  const credit = heroAttribution && creditParts
    ? <>
        {creditParts.prefix}{" "}
        <a href={heroAttribution.sourceUrl} target="_blank" rel="noopener noreferrer">{creditParts.author}</a>
        {creditParts.host ? ` / ${creditParts.host}` : null}
      </>
    : heroCaption ?? null;

  // Meta, provenance and topics sit under the image on both variants; only the
  // eyebrow, headline and dek ever move onto the plate.
  const details = (
    <div className="hero__details">
      <div className="hero__meta">
        <time dateTime={date}>{czechLongDate(date)}</time>
      </div>
      {/* Stated once, plainly, where the reader meets the edition: who wrote
          it and whether a person read it. Not a badge and not coloured. */}
      {provenance ? (
        <p className="hero__provenance">
          {provenance}{" "}
          <Link href={`${localePath(locale, "/about")}#redakce`}>{dict(locale).article.provenanceLink}&nbsp;→</Link>
        </p>
      ) : null}
      {/* Absent, not empty: many editions have no category and the row simply
          does not exist for them. */}
      {topics.length ? (
        <ul className="hero__topics" aria-label={locale === "cs" ? "Témata vydání" : "Issue topics"}>
          {topics.map((topic) => <li key={topic} className="chip">{topic}</li>)}
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
