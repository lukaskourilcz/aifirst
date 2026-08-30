import Link from "next/link";
import { isDrawnPlate, type Article, type Dispatch, type WireItem } from "@/lib/content";
import { DigestRow } from "./DigestRow";
import { SectionMasthead } from "./SectionMasthead";
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
  // The copy plate composites over a photograph only. A drawn .svg cover is
  // already composed upstream, and the oldest ones burn the headline into the
  // artwork, so those keep the stacked rendering and the title is never doubled.
  const overlay = heroPhoto !== null && !isDrawnPlate(heroPhoto);

  const figure = (
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
  );

  return (
    <section className={overlay ? "lead lead--overlay" : "lead"} aria-labelledby="lead-title">
      {overlay ? figure : null}

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
      </div>

      {/* Outside the plate by contract: the plate carries the headline, the
          meta row stays on the page under the image. */}
      <p className="lead__meta">
        <time dateTime={fm.date}>{czechNumericDate(fm.date)}</time>
        <span aria-hidden> · </span>
        <span>{readingMinutes} {common.minutesShort} {common.readMinutes}</span>
      </p>

      {overlay ? null : figure}
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
  dispatches: Dispatch[];
  wire: WireItem[];
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
          <SectionMasthead id="condensed-briefs" kicker={t.briefs} />
          <ol className="digest-list">
            {briefs.map((item, i) => (
              <DigestRow
                key={item.title}
                index={i + 1}
                title={item.title}
                summary={item.body}
                meta={item.topic}
                href={articleHref}
                locale={locale}
              />
            ))}
          </ol>
        </section>
      ) : null}

      {watch.length > 0 ? (
        <section className="condensed__column" aria-labelledby="condensed-watchlist">
          <SectionMasthead id="condensed-watchlist" kicker={t.watchlist} />
          <ol className="digest-list">
            {watch.map((item, i) => (
              <DigestRow
                key={item.url}
                index={i + 1}
                title={item.title}
                meta={item.source}
                href={item.url}
                external
                locale={locale}
              />
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
