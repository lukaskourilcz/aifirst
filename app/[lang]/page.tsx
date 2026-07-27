import Link from "next/link";
import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { Mdx } from "@/components/Mdx";
import { Wire } from "@/components/Wire";
import { EditorialHighlights } from "@/components/editorial/EditorialHighlights";
import { FeedActions } from "@/components/editorial/FeedActions";
import { IssueNavigation } from "@/components/editorial/IssueNavigation";
import { IssueMasthead } from "@/components/editorial/IssueMasthead";
import { PublicationData } from "@/components/editorial/PublicationData";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { Provenance } from "@/components/editorial/Provenance";
import { SourceLedger } from "@/components/editorial/SourceLedger";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { StructuredData } from "@/components/editorial/StructuredData";
import {
  adjacentIssues,
  getArticle,
  listArticles,
  resolveHeroPhoto,
} from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { githubRepo } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import type { Metadata } from "next";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { localizedBrand } from "@/lib/brand";
import { loadSources } from "@/lib/scraping/sources";
import { siteUrl } from "@/lib/config";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang, "/") };
}


export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const d = dict(locale);
  const publication = localizedBrand(locale);
  const lp = localePrefixer(locale);

  const allArticles = await listArticles(locale);
  const leadSummary = allArticles.find((article) => (article.type ?? "daily") === "daily") ?? allArticles[0];
  const latest = leadSummary ? await getArticle(leadSummary.slug, locale) : null;
  const archive = allArticles.slice(0, 9);
  const [glossary, sourceRegistry] = await Promise.all([loadGlossary(), loadSources()]);
  const repo = githubRepo();

  if (!latest) {
    return (
      <section className="publication-empty-state">
        <p className="eyebrow">{d.home.emptyKicker}</p>
        <h1>{d.home.emptyTitle}</h1>
        <p>
          {d.home.emptyBody}
        </p>
        <a
          href={`https://github.com/${repo}`}
          className="ghost"
          target="_blank"
          rel="noreferrer noopener"
        >
          {d.home.emptyRepoCta} ↗
        </a>
      </section>
    );
  }

  const fm = latest.frontmatter;
  const heroPhoto = resolveHeroPhoto(fm);
  const resolvedGlossary = resolveGlossaryTerms(fm.glossary_terms, glossary);
  const hasGlossary = resolvedGlossary.length > 0;
  const hasSources = (fm.sources?.length ?? 0) > 0;
  const dispatches = (fm.dispatches ?? []).slice(0, 6);
  const back = archive.filter((a) => a.slug !== latest.slug).slice(0, 6);
  const reading = readingMinutes(latest.mdx);
  const adjacent = adjacentIssues(latest.slug, allArticles);
  const base = siteUrl();
  const lastCorrection = [...(fm.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedTime = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`;

  return (
    <>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${base}/#organization`,
            name: publication.name,
            url: base,
          },
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
            mainEntityOfPage: `${base}${lp(`/articles/${latest.slug}`)}`,
            author: { "@id": `${base}/#organization` },
            publisher: { "@id": `${base}/#organization` },
            ...(heroPhoto ? { image: `${base}${heroPhoto}` } : {}),
          },
        ],
      }} />
      <header className="edition-intro">
        <p className="eyebrow">{publication.name} · {d.common.today}</p>
        <p>{publication.promise}</p>
      </header>
      <PublicationData frontmatter={fm} locale={locale} />
      <IssueMasthead
        label={(fm.type ?? "daily") === "weekly" ? d.article.weeklyDigest : d.home.todaysBriefing}
        title={fm.title}
        dek={fm.dek}
        date={fm.date}
        readingMinutes={reading}
        tags={fm.tags}
        sourceCount={fm.sources.length}
        heroPhoto={heroPhoto}
        heroAlt={fm.illustration.alt || fm.title}
        locale={locale}
      />

      <SponsorBlock sponsor={fm.sponsor} />
      <EditorialHighlights whyItMatters={fm.why_it_matters} whatChanged={fm.what_changed} uncertainty={fm.uncertainty} locale={locale} />

      {/* Article body + dispatches sidebar (sidebar's grid cell ends with the
          article's intrinsic height, so the sticky sidebar releases at the
          article's lowest point — no overflow below the body). */}
      <section className="article-with-aside enter enter-2">
        <article className="article-with-aside__main" id="briefing">
          <EditorsNote note={fm.editors_note} locale={locale} />
          <div className="article-body">
            <Mdx source={latest.mdx} />
          </div>
        </article>

        {(dispatches.length > 0 || (fm.wire ?? []).length > 0) && (
          <aside
            className="article-with-aside__side"
            aria-label={d.article.dispatchesLabel}
          >
            <Dispatches items={dispatches} locale={locale} variant="aside" />
            <Wire items={fm.wire ?? []} locale={locale} variant="aside" />
          </aside>
        )}
      </section>

      {/* Secondary blocks (Glossary + Sources) below the article */}
      <section className="issue-reference-blocks">
        <CorrectionsNotice corrections={fm.corrections} locale={locale} />
        {hasGlossary && (
          <GlossaryBlock terms={resolvedGlossary} locale={locale} />
        )}
        {hasSources && <SourceLedger sources={fm.sources ?? []} registry={sourceRegistry} locale={locale} />}
        <Provenance article={latest} locale={locale} />
      </section>

      <IssueNavigation previous={adjacent.previous} next={adjacent.next} locale={locale} />
      <p className="caught-up-completion">
        <span className="caught-up-completion__meta">{d.home.editionComplete}</span>
        <span className="caught-up-completion__message">{publication.completion}</span>
      </p>
      <FeedActions locale={locale} />

      {/* Recent issues feed */}
      {back.length > 0 && (
        <section className="recent-issues">
          <div className="section-head">
            <h2 className="section-head__title">{d.home.recentIssues}</h2>
            <Link href={lp("/archive")} className="label">
              {d.nav.archive} →
            </Link>
          </div>
          <ul className="card-grid card-grid--feed recent-issues__list">
            {back.map((a) => (
              <li key={a.slug}>
                <Link
                  href={lp(`/articles/${a.slug}`)}
                  className={
                    a.heroPhoto
                      ? "post-card"
                      : "post-card post-card--no-thumb"
                  }
                >
                  <div className="post-card__top">
                    {a.heroPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={a.heroPhoto}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="post-card__thumb"
                      />
                    ) : null}
                    <div>
                      <p className="post-card__meta">{a.date}</p>
                      <h3 className="post-card__title">{a.title}</h3>
                    </div>
                  </div>
                  {a.tags?.length ? (
                    <div className="post-card__chips">
                      {a.tags.slice(0, 3).map((t) => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
