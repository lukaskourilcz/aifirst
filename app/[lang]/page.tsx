import Link from "next/link";
import type { Metadata } from "next";
import { CondensedBriefs, LeadPackage } from "@/components/editorial/LeadPackage";
import { SectionMasthead } from "@/components/editorial/SectionMasthead";
import { PageShell } from "@/components/PageShell";
import { FeedRow } from "@/components/editorial/FeedRow";
import { RightRail } from "@/components/editorial/RightRail";
import { WeekAction } from "@/components/editorial/WeekAction";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { StructuredData } from "@/components/editorial/StructuredData";
import { articlePhotos, getArticle, listArticles, watchlistWithoutBriefs } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { czechPlural } from "@/lib/text";
import { sectionLabel, sectionOf } from "@/lib/sections";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { localizedBrand } from "@/lib/brand";
import { loadEvents, splitByAnchor } from "@/lib/events";
import { readPractical } from "@/lib/practical";
import { homeEditionState, isPublishingDay, listBoardContexts } from "@/lib/board";
import { czechWeekdayDate, weekBeforeWindow, weekTitle, withinLastDays } from "@/lib/weeks";

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
      <PageShell kicker={d.home.emptyKicker} title={d.home.emptyTitle} intro={d.home.emptyBody} />
    );
  }

  const fm = latest.frontmatter;
  const photos = articlePhotos(fm);
  const heroPhoto = photos.hero;
  const base = siteUrl();
  const articleHref = lp(`/articles/${latest.slug}`);

  // A weekday with a no_edition record newer than the latest edition is a
  // missed day and the page says so. A weekend is not: Saturday and Sunday
  // lead with Friday's edition as „Poslední vydání". Every date is measured
  // against the newest record, never a clock, so the same content always
  // builds the same HTML.
  const { anchor, missedDay, leadIsEarlier } = homeEditionState(await listBoardContexts(), fm.date);
  const week = withinLastDays(allArticles, anchor, 7).filter((a) => a.slug !== latest.slug);
  const briefCount = (fm.dispatches ?? []).length;
  const watchCount = watchlistWithoutBriefs(fm.wire ?? [], fm.dispatches ?? []).length;
  const weekend = !isPublishingDay(anchor);
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

      <div className="front">
        <div className="front__edition">
          {/* Which edition this is, and what it holds. The date is the
              edition's own; on a weekend the line says the paper is off. */}
          <div className="edition-line">
            <p className="label">
              {leadIsEarlier ? t.latestEdition : t.todaysEdition} ·{" "}
              <time dateTime={fm.date}>{czechWeekdayDate(fm.date)}</time>
            </p>
            <p className="meta">
              {czechPlural(1, "článek", "články", "článků")}
              {briefCount ? ` · ${briefCount} krátce` : null}
              {watchCount ? ` · ${watchCount} ke sledování` : null}
              {weekend ? ` · ${t.weekendOff}` : null}
            </p>
          </div>

          {/* A missed weekday is one quiet line, not a headline: the newest
              edition still leads. Tertiary, not warning amber, because a day
              without an edition is a normal editorial state. */}
          {missedDay ? (
            <p className="empty-line">
              {t.noEditionLine.replace("{date}", czechWeekdayDate(missedDay))}
            </p>
          ) : null}

          <LeadPackage article={latest} locale={locale} photos={photos} section={sectionLabel(sectionOf(fm.tags))} />

          <SponsorBlock sponsor={fm.sponsor} />
          <CondensedBriefs
            dispatches={fm.dispatches ?? []}
            wire={fm.wire ?? []}
            locale={locale}
            articleHref={articleHref}
          />
          <CorrectionsNotice corrections={fm.corrections} locale={locale} />

          {/* The mark closes the edition, not the page: everything above is
              the edition, everything below is recirculation. */}
          <p className="edition-end">
            <span className="kicker edition-end__done">{d.home.editionComplete}</span>
            <span className="kicker edition-end__message">{publication.completion}</span>
          </p>

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

        <RightRail locale={locale} dateKey={fm.date} events={upcoming} practical={readPractical(fm.practical, fm.date)} />
      </div>
    </>
  );
}
