import Link from "next/link";
import type { Metadata } from "next";
import { DayBriefs, DayWatchlist, LeadPackage } from "@/components/editorial/LeadPackage";
import { Card } from "@/components/editorial/Card";
import { DailyLesson } from "@/components/editorial/DailyLesson";
import { BannerSlot } from "@/components/editorial/BannerSlot";
import { PracticalTip } from "@/components/editorial/PracticalTip";
import { SectionMasthead } from "@/components/editorial/SectionMasthead";
import { PageShell } from "@/components/PageShell";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { StructuredData } from "@/components/editorial/StructuredData";
import { articlePhotos, getArticle, listArticles } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { sectionLabel, sectionOf } from "@/lib/sections";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { localizedBrand } from "@/lib/brand";
import { readPractical } from "@/lib/practical";
import { homeEditionState, isPublishingDay, listBoardContexts } from "@/lib/board";
import { czechWeekdayDate, czechWeekdayGenitiveShort, czechWeekdayShort } from "@/lib/weeks";

export const dynamic = "force-static";

/** How many articles „Poslední články" shows: three rows of the two-column grid. */
const RECENT_COUNT = 6;

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
  // lead with Friday's edition. Every date is measured
  // against the newest record, never a clock, so the same content always
  // builds the same HTML.
  const { anchor, missedDay } = homeEditionState(await listBoardContexts(), fm.date);
  const weekend = !isPublishingDay(anchor);
  // „Poslední články": the newest published articles after the lead, however
  // far back they go, so a quiet week never empties the block.
  const recent = allArticles.filter((a) => a.slug !== latest.slug).slice(0, RECENT_COUNT);

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

          {/* The day's fixed modules: Krátce beside Ke sledování, Pojem dne
              and the house creative. */}
          <div className="day-band">
            <DayBriefs dispatches={fm.dispatches ?? []} locale={locale} />
            <div className="day-band__aside">
              <PracticalTip practical={readPractical(fm.practical, fm.date)} locale={locale} />
              <DayWatchlist wire={fm.wire ?? []} dispatches={fm.dispatches ?? []} locale={locale} />
              <DailyLesson dateKey={fm.date} locale={locale} />
              <BannerSlot id="rail-square" locale={locale} />
            </div>
          </div>
          <CorrectionsNotice corrections={fm.corrections} locale={locale} />

          {/* The completion row closes the day's edition, not the page. */}
          <p className="edition-end">
            <span className="label edition-end__done">
              {weekend ? `${d.home.editionCompleteFrom} ${czechWeekdayGenitiveShort(fm.date)}` : d.home.editionCompleteToday}
            </span>
            <span className="edition-end__message">{publication.completion}</span>
          </p>

          {recent.length > 0 ? (
            <section className="week-block" aria-labelledby="latest-articles">
              <SectionMasthead
                id="latest-articles"
                kicker={t.latestArticles}
                action={{ href: lp("/archive"), label: t.latestArticlesAll }}
              />
              <ul className="week-block__grid">
                {recent.map((article) => (
                  <li key={article.slug}>
                    <Card
                      href={lp(`/articles/${article.slug}`)}
                      title={article.title}
                      titleLang={article.lang === "en" ? "en" : undefined}
                      label={
                        <>
                          {sectionLabel(sectionOf(article.tags)) ? (
                            <span className="label--section">{sectionLabel(sectionOf(article.tags))}</span>
                          ) : null}
                          {sectionLabel(sectionOf(article.tags)) ? " · " : null}
                          {czechWeekdayShort(article.date)}
                        </>
                      }
                      dek={article.dek}
                      image={article.heroPhoto}
                      date={article.date}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
