import Link from "next/link";
import { watchlistWithoutBriefs, type Article, type Dispatch, type WireItem } from "@/lib/content";
import { DigestRow } from "./DigestRow";
import { SectionMasthead } from "./SectionMasthead";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { briefSectionLabel, hostOf, photoCreditParts, sourceName } from "@/lib/labels";
import { loadSources } from "@/lib/sources";
import { czechPlural, looksEnglish } from "@/lib/text";

/** The lead pairs native display type with a separately framed photograph.
 * The source count, credit, and context remain visible beneath it. */
export function LeadPackage({
  article,
  locale,
  photos,
  section,
}: {
  article: Article;
  locale: Locale;
  photos: { hero: string | null; thumb: string | null; own: boolean };
  section: string | null;
}) {
  const fm = article.frontmatter;
  const t = dict(locale);
  const href = localePath(locale, `/articles/${article.slug}`);
  const credit = photos.own && fm.illustration.attribution ? photoCreditParts(fm.illustration.attribution) : null;
  const sourceCount = (fm.sources ?? []).length;
  const why = fm.why_it_matters ?? [];

  return (
    <section className={photos.hero ? "lead" : "lead lead--type"} aria-labelledby="lead-title">
      {photos.hero ? (
        <Link href={href} className="lead__media">
          <picture>
            {photos.thumb ? <source media="(max-width: 960px)" srcSet={photos.thumb} /> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos.hero} alt="" width={1600} height={800} decoding="async" fetchPriority="high" />
          </picture>
          <div className="lead__band">
            {section ? <p className="label lead__section">{section}</p> : null}
            <h1 id="lead-title" className="lead__title">{fm.title}</h1>
            <span className="lead__read">{locale === "cs" ? "Přečíst vydání" : "Read the edition"}<span aria-hidden="true">↗</span></span>
          </div>
        </Link>
      ) : (
        <>
          {section ? <p className="label lead__section">{section}</p> : null}
          <h1 id="lead-title" className="lead__title">
            <Link href={href}>{fm.title}</Link>
          </h1>
        </>
      )}

      <div className="lead__below">
        <div>
          <p className="lead__dek">{fm.dek}</p>
          <p className="meta lead__meta">
            {czechPlural(sourceCount, "zdroj", "zdroje", "zdrojů")}
            {credit ? ` · ${credit.prefix} ${credit.author}${credit.host ? ` / ${credit.host}` : ""}` : null}
          </p>
        </div>
        {why.length ? (
          <aside className="lead__why" aria-labelledby="lead-why">
            <p id="lead-why" className="label">{t.article.whyItMatters}</p>
            <ul>
              {why.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

const COUNT_WORDS = ["", "Jedna zpráva", "Dvě zprávy", "Tři zprávy", "Čtyři zprávy", "Pět zpráv", "Šest zpráv"];

/**
 * „Krátce": the day's Briefs in two columns, each linking to its own source.
 */
export function DayBriefs({ dispatches, locale }: { dispatches: Dispatch[]; locale: Locale }) {
  const t = dict(locale).sections;
  const briefs = dispatches.slice(0, 6);
  if (briefs.length === 0) return null;
  const count = COUNT_WORDS[briefs.length];
  return (
    <section className="day-briefs" aria-labelledby="day-briefs">
      <SectionMasthead
        id="day-briefs"
        kicker={t.briefs}
        note={count ? `${count} dne, každá s\u00a0odkazem na zdroj.` : undefined}
      />
      <ol className="digest-list digest-list--grid">
        {briefs.map((item) => (
          <DigestRow
            key={item.title}
            title={item.title}
            summary={item.body}
            label={briefSectionLabel(item.topic) ?? undefined}
            host={hostOf(item.source_url) || undefined}
            href={item.source_url}
            external={Boolean(item.source_url)}
            locale={locale}
          />
        ))}
      </ol>
    </section>
  );
}

/**
 * „Ke sledování": links without commentary, in their original wording. A story
 * already told as a Brief is left out.
 */
export async function DayWatchlist({
  wire,
  dispatches,
  locale,
  limit = 4,
}: {
  wire: WireItem[];
  dispatches: Dispatch[];
  locale: Locale;
  limit?: number;
}) {
  const t = dict(locale).sections;
  const watch = watchlistWithoutBriefs(wire, dispatches).slice(0, limit);
  if (watch.length === 0) return null;
  const registry = await loadSources();
  return (
    <section className="day-watch" aria-labelledby="day-watch">
      <SectionMasthead id="day-watch" kicker={t.watchlist} note={"Odkazy bez komentáře, v\u00a0původním znění."} />
      <ol className="digest-list">
        {watch.map((item) => {
          const host = hostOf(item.url);
          const via = sourceName(item.source, registry, item.url);
          return (
            <DigestRow
              key={item.url}
              variant="watch"
              title={item.title}
              titleLang={looksEnglish(item.title) ? "en" : undefined}
              host={host || undefined}
              via={via && via !== host ? via : undefined}
              href={item.url}
              external
              locale={locale}
            />
          );
        })}
      </ol>
    </section>
  );
}
