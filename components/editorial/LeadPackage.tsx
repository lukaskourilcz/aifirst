import Link from "next/link";
import type { Article } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechNumericDate } from "@/lib/weeks";

/**
 * A deterministic 45° hairline plate, seeded from the slug so one article
 * always gets the same one. Decorative by construction: no icon, no
 * illustration, no headline burned in.
 */
function HeroPlate({ slug, ratio }: { slug: string; ratio: string }) {
  const seed = [...slug].reduce((total, character) => total + character.charCodeAt(0), 0);
  const id = `plate-${seed % 997}`;
  return (
    <div className="hero-plate" style={{ aspectRatio: ratio }} role="presentation" aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={`rotate(45 0 0) translate(${seed % 6} 0)`}>
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border-subtle)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <span className="hero-plate__mark">DNESKAi</span>
    </div>
  );
}

/**
 * The front page lead: today's edition as a headline that goes to the article,
 * not as the article itself. The meta row is date and reading minutes, and
 * nothing else.
 *
 * Czech lead headlines run long, so past 100 characters the hero drops from
 * display size to heading size. That keeps the dek and the meta row above the
 * fold on a 900px viewport instead of pushing them off it.
 */
export function LeadPackage({
  article,
  locale,
  heroPhoto,
  readingMinutes,
}: {
  article: Article;
  locale: Locale;
  heroPhoto: string | null;
  readingMinutes: number;
}) {
  const fm = article.frontmatter;
  const t = dict(locale).sections;
  const common = dict(locale).common;
  const href = localePath(locale, `/articles/${article.slug}`);
  const long = fm.title.length > 100;

  return (
    <section className="lead" aria-labelledby="lead-title">
      <div className="lead__copy">
        <p className="lead__kicker">
          {t.todaysEdition}
          <span aria-hidden> · </span>
          <time dateTime={fm.date}>{czechNumericDate(fm.date)}</time>
        </p>
        <h1 id="lead-title" className="lead__title" data-long={long ? "true" : undefined}>
          <Link href={href}>{fm.title}</Link>
        </h1>
        <p className="lead__dek">{fm.dek}</p>
        <p className="lead__meta">
          <time dateTime={fm.date}>{czechNumericDate(fm.date)}</time>
          <span aria-hidden> · </span>
          <span>{readingMinutes} {common.minutesShort} {common.readMinutes}</span>
        </p>
      </div>

      <Link href={href} className="lead__figure" tabIndex={-1} aria-hidden="true">
        {heroPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroPhoto}
            alt=""
            width={680}
            height={291}
            decoding="async"
            className="lead__image"
          />
        ) : (
          <HeroPlate slug={article.slug} ratio="21 / 9" />
        )}
      </Link>
    </section>
  );
}

/**
 * „Ve zkratce" and „Na radaru" beside the lead: four headline links each, the
 * rest of what mattered without leaving the front page.
 */
export function CondensedBriefs({
  dispatches,
  wire,
  locale,
  articleHref,
}: {
  dispatches: Array<{ title: string }>;
  wire: Array<{ title: string; url?: string }>;
  locale: Locale;
  articleHref: string;
}) {
  const t = dict(locale).sections;
  const briefs = dispatches.slice(0, 4);
  const watch = wire.slice(0, 4);
  if (briefs.length === 0 && watch.length === 0) return null;

  return (
    <div className="condensed">
      {briefs.length > 0 ? (
        <section className="condensed__column" aria-labelledby="condensed-briefs">
          <h2 id="condensed-briefs" className="condensed__kicker">{t.briefs}</h2>
          <ol className="condensed__list">
            {briefs.map((item, i) => (
              <li key={item.title}>
                <span aria-hidden className="condensed__index">{String(i + 1).padStart(2, "0")}</span>
                <Link href={articleHref}>{item.title}</Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {watch.length > 0 ? (
        <section className="condensed__column" aria-labelledby="condensed-watchlist">
          <h2 id="condensed-watchlist" className="condensed__kicker">{t.watchlist}</h2>
          <ol className="condensed__list">
            {watch.map((item, i) => (
              <li key={item.title}>
                <span aria-hidden className="condensed__index">{String(i + 1).padStart(2, "0")}</span>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                    <span aria-hidden> ↗</span>
                    <span className="sr-only"> {t.opensInNewWindow}</span>
                  </a>
                ) : (
                  <Link href={articleHref}>{item.title}</Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
