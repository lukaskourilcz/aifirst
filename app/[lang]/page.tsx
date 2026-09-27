import Link from "next/link";
import type { Metadata } from "next";
import { CondensedBriefs, LeadPackage } from "@/components/editorial/LeadPackage";
import { SectionMasthead } from "@/components/editorial/SectionMasthead";
import { FeedRow } from "@/components/editorial/FeedRow";
import { RightRail } from "@/components/editorial/RightRail";
import { WeekAction } from "@/components/editorial/WeekAction";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { StructuredData } from "@/components/editorial/StructuredData";
import { getArticle, listArticles, resolveHeroPhoto } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { localizedBrand } from "@/lib/brand";
import { loadEvents, splitByAnchor } from "@/lib/events";
import { homeEditionState, listBoardContexts } from "@/lib/board";
import { czechLongDate, czechNumericDate, czechWeekday, weekBeforeWindow, weekTitle, withinLastDays } from "@/lib/weeks";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang, "/") };
}

export default async function HomePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const d = dict(locale);
  const t = d.sections;
  const publication = localizedBrand(locale);
  const lp = localePrefixer(locale);

  const allArticles = await listArticles(locale);
  const leadSummary = allArticles.find((article) => (article.type ?? "daily") === "daily") ?? allArticles[0];
  const latest = leadSummary ? await getArticle(leadSummary.slug, locale) : null;

  if (!latest) {
    return (
      <section className="publication-empty-state">
        <p className="eyebrow">{d.home.emptyKicker}</p>
        <h1>{d.home.emptyTitle}</h1>
        <p>{d.home.emptyBody}</p>
      </section>
    );
  }

  const fm = latest.frontmatter;
  const heroPhoto = resolveHeroPhoto(fm);
  const reading = readingMinutes(latest.mdx);
  const base = siteUrl();
  const articleHref = lp(`/articles/${latest.slug}`);

  // A weekday with a no_edition record newer than the latest edition is a
  // missed day and the page says so. A weekend is not: Saturday and Sunday
  // lead with Friday's edition as „Poslední vydání". Every date is measured
  // against the newest record, never a clock, so the same content always
  // builds the same HTML.
  const { anchor, missedDay, leadIsEarlier } = homeEditionState(await listBoardContexts(), fm.date);
  const noEditionToday = missedDay !== null;
  const week = withinLastDays(allArticles, anchor, 7).filter(
    (a) => noEditionToday || a.slug !== latest.slug,
  );
  const { upcoming } = splitByAnchor(loadEvents(), anchor);
  const older = weekBeforeWindow(allArticles, anchor);

  const lastCorrection = [...(fm.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedTime = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`;

  return (
    <>
      {fm.generation?.package_hash ? (
        <meta name="boardless-content-hash" content={fm.generation.package_hash} />
      ) : null}
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${base}/#organization`, name: publication.name, url: base },
            {
              "@type": "WebSite",
              "@id": `${base}/#website`,
              name: publication.name,
              description: publication.promise,
              url: `${base}${lp("/")}`,
              inLanguage: locale,
              publisher: { "@id": `${base}/#organization` },
            },
            {
              "@type": "NewsArticle",
              headline: fm.title,
              description: fm.dek,
              datePublished: fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`,
              dateModified: modifiedTime,
              inLanguage: latest.lang,
              mainEntityOfPage: `${base}${articleHref}`,
              author: { "@id": `${base}/#organization` },
              publisher: { "@id": `${base}/#organization` },
              ...(heroPhoto ? { image: `${base}${heroPhoto}` } : {}),
            },
          ],
        }}
      />

      <div className="page-with-rail">
        <div className="page-with-rail__main">
          {/* The front page dateline: who is publishing and for which day. */}
          <header className="dateline">
            <p className="dateline__edition">
              <span className="dateline__name">{publication.name}</span>
              <span aria-hidden> · </span>
              <time dateTime={anchor}>{czechWeekday(anchor)} {czechLongDate(anchor)}</time>
            </p>
          </header>

          {noEditionToday ? (
            /* Tertiary, not warning amber: a day without an edition is a normal
               editorial state, and colouring it would reintroduce the status
               telemetry this redesign removed. */
            <section className="no-edition" aria-labelledby="no-edition-title">
              <p className="no-edition__kicker">
                {t.noEditionKicker}
                {missedDay ? (
                  <>
                    <span aria-hidden> · </span>
                    <time dateTime={missedDay}>{czechNumericDate(missedDay)}</time>
                  </>
                ) : null}
              </p>
              <h1 id="no-edition-title" className="no-edition__title">{t.noEditionTitle}</h1>
              <p className="no-edition__body">{t.noEditionBody}</p>
            </section>
          ) : (
            <>
              <LeadPackage article={latest} locale={locale} heroPhoto={heroPhoto} readingMinutes={reading} earlier={leadIsEarlier} />

              <SponsorBlock sponsor={fm.sponsor} />
              <CondensedBriefs
                dispatches={fm.dispatches ?? []}
                wire={fm.wire ?? []}
                locale={locale}
                articleHref={articleHref}
              />
              <CorrectionsNotice corrections={fm.corrections} locale={locale} />

              {/* The mark closes the edition, not the page: everything above is
                  today's edition, everything below is recirculation. There is
                  no mark on a day with no edition to complete. */}
              <p className="edition-end">
                <span className="kicker edition-end__done">{d.home.editionComplete}</span>
                <span className="kicker edition-end__message">{publication.completion}</span>
              </p>
            </>
          )}

          {week.length > 0 ? (
            <section className="feed-section" aria-labelledby="last-week">
              <SectionMasthead
                id="last-week"
                kicker={t.lastWeek}
                action={{ href: lp("/tyden"), label: t.all }}
              />
              <ul className="feed-list">
                {week.map((article) => (
                  <FeedRow key={article.slug} article={article} locale={locale} />
                ))}
              </ul>
              {older ? (
                <WeekAction
                  locale={locale}
                  href={lp(`/tyden/${older.id}`)}
                  kicker={t.previousWeek}
                  label={weekTitle(older)}
                />
              ) : null}
            </section>
          ) : null}

        </div>

        <RightRail locale={locale} dateKey={fm.date} events={upcoming} />
      </div>
    </>
  );
}
