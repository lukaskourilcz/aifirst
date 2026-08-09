import Link from "next/link";
import type { Metadata } from "next";
import { CondensedBriefs, LeadPackage } from "@/components/editorial/LeadPackage";
import { FeedRow } from "@/components/editorial/FeedRow";
import { RightRail } from "@/components/editorial/RightRail";
import { WeekAction } from "@/components/editorial/WeekAction";
import { FeedActions } from "@/components/editorial/FeedActions";
import { IssueNavigation } from "@/components/editorial/IssueNavigation";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { StructuredData } from "@/components/editorial/StructuredData";
import { adjacentIssues, getArticle, listArticles, resolveHeroPhoto } from "@/lib/content";
import { githubRepo, siteUrl } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { localizedBrand } from "@/lib/brand";
import { loadEvents, splitByAnchor } from "@/lib/events";
import { listBoardContexts } from "@/lib/board";
import { czechNumericDate, previousWeek, weekTitle, withinLastDays } from "@/lib/weeks";

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
        <a href={`https://github.com/${githubRepo()}`} className="ghost" target="_blank" rel="noreferrer noopener">
          {d.home.emptyRepoCta} ↗
        </a>
      </section>
    );
  }

  const fm = latest.frontmatter;
  const heroPhoto = resolveHeroPhoto(fm);
  const reading = readingMinutes(latest.mdx);
  const adjacent = adjacentIssues(latest.slug, allArticles);
  const base = siteUrl();
  const articleHref = lp(`/articles/${latest.slug}`);

  // Some days have no edition. The board records that honestly, and a record
  // dated after the newest article is what makes today one of those days. The
  // page says so rather than promoting a back issue into the lead slot.
  const boards = await listBoardContexts();
  const newestBoard = [...boards].sort((a, b) => b.date.localeCompare(a.date))[0];
  const noEditionToday =
    newestBoard !== undefined && newestBoard.status === "no_edition" && newestBoard.date > fm.date;

  // Every date on this page is measured against the newest record, never a
  // clock, so the same content always builds the same HTML.
  const anchor = noEditionToday && newestBoard ? newestBoard.date : fm.date;
  const week = withinLastDays(allArticles, anchor, 7).filter(
    (a) => noEditionToday || a.slug !== latest.slug,
  );
  const { upcoming } = splitByAnchor(loadEvents(), anchor);

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
          <header className="edition-intro">
            <p className="eyebrow">{publication.name} · {d.common.today}</p>
            <p>{publication.promise}</p>
          </header>

          {noEditionToday ? (
            /* Tertiary, not warning amber: a day without an edition is a normal
               editorial state, and colouring it would reintroduce the status
               telemetry this redesign removed. */
            <section className="no-edition" aria-labelledby="no-edition-title">
              <p className="no-edition__kicker">
                {t.noEditionKicker}
                {newestBoard ? (
                  <>
                    <span aria-hidden> · </span>
                    <time dateTime={newestBoard.date}>{czechNumericDate(newestBoard.date)}</time>
                  </>
                ) : null}
              </p>
              <h1 id="no-edition-title" className="no-edition__title">{t.noEditionTitle}</h1>
              <p className="no-edition__body">{t.noEditionBody}</p>
            </section>
          ) : (
            <>
              <LeadPackage article={latest} locale={locale} heroPhoto={heroPhoto} readingMinutes={reading} />

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
              <p className="caught-up-completion">
                <span className="caught-up-completion__meta">{d.home.editionComplete}</span>
                <span className="caught-up-completion__message">{publication.completion}</span>
              </p>
            </>
          )}

          {week.length > 0 ? (
            <section className="feed-section" aria-labelledby="last-week">
              <div className="section-head">
                <h2 id="last-week" className="section-head__title">{t.lastWeek}</h2>
                <Link href={lp("/tyden")} className="label">{t.all} →</Link>
              </div>
              <ul className="feed-list">
                {week.map((article) => (
                  <FeedRow key={article.slug} article={article} locale={locale} />
                ))}
              </ul>
              <WeekAction
                locale={locale}
                href={lp(`/tyden/${previousWeek(anchor).id}`)}
                kicker={t.previousWeek}
                label={weekTitle(previousWeek(anchor))}
              />
            </section>
          ) : null}

          <IssueNavigation previous={adjacent.previous} next={adjacent.next} locale={locale} />
          <FeedActions locale={locale} />
        </div>

        <RightRail locale={locale} dateKey={fm.date} events={upcoming} />
      </div>
    </>
  );
}
