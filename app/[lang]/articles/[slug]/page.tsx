import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { Mdx } from "@/components/Mdx";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedIssues } from "@/components/RelatedIssues";
import { Wire } from "@/components/Wire";
import { WeeklyBadge } from "@/components/WeeklyBadge";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { EditorialHighlights } from "@/components/editorial/EditorialHighlights";
import { FeedActions } from "@/components/editorial/FeedActions";
import { IssueNavigation } from "@/components/editorial/IssueNavigation";
import { IssueMasthead } from "@/components/editorial/IssueMasthead";
import { PublicationData } from "@/components/editorial/PublicationData";
import { Provenance } from "@/components/editorial/Provenance";
import { SourceLedger } from "@/components/editorial/SourceLedger";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { StructuredData } from "@/components/editorial/StructuredData";
import {
  adjacentIssues,
  getArticle,
  getArticleLocales,
  listArticles,
  relatedArticles,
  resolveHeroPhoto,
  type ArticleSummary,
} from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { relatedBySimilarity } from "@/lib/embeddings";
import { readingMinutes } from "@/lib/text";
import { type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { loadSources } from "@/lib/scraping/sources";
import { siteUrl } from "@/lib/config";
import { localizedBrand } from "@/lib/brand";
import { loadTopicsConfig, topicsForArticle } from "@/lib/topics/config";
import Link from "next/link";
import { localePath } from "@/lib/i18n/config";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const all = await listArticles();
  return all.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = await getArticle(slug, lang);
  if (!article) return {};
  const articlePath = `/articles/${slug}`;
  const availableLocales = await getArticleLocales(slug);
  const heroPhoto = resolveHeroPhoto(article.frontmatter);
  const lastCorrection = [...(article.frontmatter.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedTime = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : article.frontmatter.generation?.generated_at ?? `${article.frontmatter.date}T06:00:00Z`;
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.dek,
    alternates: localeAlternates(lang, articlePath, availableLocales),
    openGraph: {
      type: "article",
      title: article.frontmatter.title,
      description: article.frontmatter.dek,
      publishedTime: `${article.frontmatter.date}T06:00:00Z`,
      modifiedTime,
      ...(heroPhoto ? { images: [{ url: heroPhoto }] } : {}),
    },
  };
}


export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang: locale, slug } = await params;
  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const d = dict(locale);
  const all = await listArticles(locale);
  const summary: ArticleSummary = {
    slug: article.slug,
    date: article.frontmatter.date,
    title: article.frontmatter.title,
    tags: article.frontmatter.tags,
  };
  // Prefer semantic similarity when article embeddings are present; fall back
  // to tag overlap otherwise (no Jina key / not embedded yet).
  const related =
    relatedBySimilarity(summary, all, locale, 3) ??
    relatedArticles(summary, all, 3);
  const isWeekly = (article.frontmatter.type ?? "daily") === "weekly";
  const titlesBySlug = new Map(all.map((a) => [a.slug, a.title]));
  const glossary = await loadGlossary();
  const [sourceRegistry, topicsConfig] = await Promise.all([loadSources(), loadTopicsConfig()]);
  const issueGlossary = resolveGlossaryTerms(
    article.frontmatter.glossary_terms,
    glossary,
  );
  const fm = article.frontmatter;
  const dispatches = (fm.dispatches ?? []).slice(0, 6);
  const reading = readingMinutes(article.mdx);
  const heroPhoto = resolveHeroPhoto(fm);
  const adjacent = adjacentIssues(article.slug, all);
  const topics = topicsForArticle(topicsConfig, summary);
  const base = siteUrl();
  const publication = localizedBrand(locale);
  const lastCorrection = [...(fm.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedTime = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`;

  return (
    <>
      <ReadingProgress />
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
            "@type": isWeekly ? "Article" : "NewsArticle",
            headline: fm.title,
            description: fm.dek,
            datePublished: fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`,
            dateModified: modifiedTime,
            inLanguage: article.lang,
            mainEntityOfPage: `${base}${localePath(locale, `/articles/${article.slug}`)}`,
            author: { "@id": `${base}/#organization` },
            publisher: { "@id": `${base}/#organization` },
            about: topics.map((topic) => topic.title[locale]),
            ...(heroPhoto ? { image: `${base}${heroPhoto}` } : {}),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: publication.name, item: `${base}${localePath(locale, "/")}` },
              { "@type": "ListItem", position: 2, name: isWeekly ? d.nav.weekly : d.nav.archive, item: `${base}${localePath(locale, isWeekly ? "/weekly" : "/archive")}` },
              { "@type": "ListItem", position: 3, name: fm.title, item: `${base}${localePath(locale, `/articles/${article.slug}`)}` },
            ],
          },
        ],
      }} />

      <PublicationData frontmatter={fm} locale={locale} />
      <IssueMasthead
        label={isWeekly ? d.article.weeklyDigest : d.home.todaysBriefing}
        title={fm.title}
        dek={fm.dek}
        date={fm.date}
        readingMinutes={reading}
        tags={fm.tags}
        sourceCount={fm.sources.length}
        heroPhoto={heroPhoto}
        heroAlt={heroPhoto === fm.illustration.path ? fm.illustration.alt : ""}
        heroCaption={heroPhoto === fm.illustration.path ? fm.illustration.prompt : undefined}
        locale={locale}
      />

      <SponsorBlock sponsor={fm.sponsor} />
      <EditorialHighlights whyItMatters={fm.why_it_matters} whatChanged={fm.what_changed} uncertainty={fm.uncertainty} locale={locale} />

      {/* Body + dispatches sidebar */}
      <section className="article-with-aside enter enter-2">
        <article className="article-with-aside__main">
          {article.fallback && (
            <p className="fallback-notice">
              {d.article.enOnlyNotice}
            </p>
          )}
          {isWeekly && fm.digest && (
            <WeeklyBadge
              from={fm.digest.from}
              to={fm.digest.to}
              coveredSlugs={fm.digest.covered_slugs}
              titlesBySlug={titlesBySlug}
              locale={locale}
            />
          )}
          <EditorsNote note={fm.editors_note} locale={locale} />
          <div className="article-body">
            <Mdx source={article.mdx} />
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

      <section className="issue-reference-blocks">
        <CorrectionsNotice corrections={fm.corrections} locale={locale} />
        <GlossaryBlock terms={issueGlossary} locale={locale} />
        {topics.length ? (
          <nav aria-label={locale === "cs" ? "Témata článku" : "Article topics"} className="issue-topics">
            {topics.map((topic) => <Link key={topic.slug} className="chip" href={localePath(locale, `/topics/${topic.slug}`)}>{topic.title[locale]}</Link>)}
          </nav>
        ) : null}
        <SourceLedger sources={fm.sources ?? []} registry={sourceRegistry} locale={locale} />
        <Provenance article={article} locale={locale} />
        <p className="issue-print-action">
          <a
            href={localePath(locale, `/articles/${article.slug}/print`)}
            className="label"
            target="_blank"
            rel="noopener"
          >
            ↗ {d.article.printView}
          </a>
        </p>
        <RelatedIssues items={related} locale={locale} />
        <IssueNavigation previous={adjacent.previous} next={adjacent.next} locale={locale} />
        <p className="caught-up-completion">
          <span className="caught-up-completion__meta">{d.home.editionComplete}</span>
          <span className="caught-up-completion__message">{publication.completion}</span>
        </p>
        <FeedActions locale={locale} />
      </section>
    </>
  );
}
