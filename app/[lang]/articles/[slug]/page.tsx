import { editorialHold, heldArticleSlugs } from "@/lib/editorial-holds";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { Mdx } from "@/components/Mdx";
import { BannerSlot } from "@/components/editorial/BannerSlot";
import { Wire } from "@/components/Wire";
import { WeeklyBadge } from "@/components/WeeklyBadge";
import { CorrectionsNotice } from "@/components/editorial/CorrectionsNotice";
import { EditorialHighlights } from "@/components/editorial/EditorialHighlights";
import { SectionMasthead } from "@/components/editorial/SectionMasthead";
import { Card } from "@/components/editorial/Card";
import { IssueMasthead } from "@/components/editorial/IssueMasthead";
import { SourceLedger } from "@/components/editorial/SourceLedger";
import { SponsorBlock } from "@/components/editorial/SponsorBlock";
import { PracticalTip } from "@/components/editorial/PracticalTip";
import { readPractical } from "@/lib/practical";
import { shareImagePath } from "@/lib/share-card";
import { StructuredData } from "@/components/editorial/StructuredData";
import {
  adjacentIssues,
  getArticle,
  getArticleLocales,
  listArticles,
  articlePhotos,
  watchlistWithoutBriefs,
  type ArticleSummary,
} from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { loadSources } from "@/lib/sources";
import { siteUrl } from "@/lib/config";
import { localizedBrand } from "@/lib/brand";
import { loadTopicsConfig, topicsForArticle } from "@/lib/topics/config";
import Link from "next/link";
import { localePath } from "@/lib/i18n/config";
import { czechDatesInText, czechLongDate, czechNumericDate, czechWeekdayDate, czechWeekdayShort } from "@/lib/weeks";
import { sectionLabel, sectionOf } from "@/lib/sections";
import { verificationSentence } from "@/lib/labels";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const all = await listArticles();
  return [...all.map((a) => ({ slug: a.slug })), ...heldArticleSlugs().map(slug => ({ slug }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = await getArticle(slug, lang);
  if (!article) return {};
  if (editorialHold(slug)) return {
    title: "Vydání dočasně staženo",
    description: editorialHold(slug)!.reason,
    robots: { index: false, follow: false },
    openGraph: { title: "Vydání dočasně staženo", description: editorialHold(slug)!.reason, images: [] },
  };
  const articlePath = `/articles/${slug}`;
  const alternates = localeAlternates(lang, articlePath);
  const availableLocales = await getArticleLocales(slug);
  const heroPhoto = articlePhotos(article.frontmatter).hero;
  const lastCorrection = [...(article.frontmatter.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedTime = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : article.frontmatter.generation?.generated_at ?? `${article.frontmatter.date}T06:00:00Z`;
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.dek,
    alternates: {
      ...alternates,
      // The same edition as plain Markdown, for readers and language models (issue #99).
      types: { ...alternates.types, "text/markdown": `${articlePath}.md` },
    },
    openGraph: {
      type: "article",
      title: article.frontmatter.title,
      description: article.frontmatter.dek,
      publishedTime: `${article.frontmatter.date}T06:00:00Z`,
      modifiedTime,
      images: heroPhoto
        ? [{ url: heroPhoto }]
        : [{ url: shareImagePath(slug, "og"), width: 1200, height: 630, alt: article.frontmatter.title }],
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
  const hold = editorialHold(slug);
  if (hold) return (
    <section className="section">
      <h1>Vydání dočasně staženo</h1>
      <p>{hold.reason}</p>
      <p><time dateTime={hold.date}>{czechLongDate(hold.date)}</time></p>
      <p><Link href={localePath(locale, "/")}>Zpět na aktuální vydání</Link></p>
    </section>
  );

  const d = dict(locale);
  const all = await listArticles(locale);
  const summary: ArticleSummary = {
    slug: article.slug,
    date: article.frontmatter.date,
    title: article.frontmatter.title,
    tags: article.frontmatter.tags,
  };
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
  const wire = watchlistWithoutBriefs(fm.wire ?? [], fm.dispatches ?? []);
  const photos = articlePhotos(fm);
  const heroPhoto = photos.hero;
  const adjacent = adjacentIssues(article.slug, all);
  const sectionKey = sectionOf(fm.tags);
  // Part A: the neighbouring editions stand in for „Další z dnešního vydání"
  // until an edition can hold more than one article (Part B).
  const position = all.findIndex((item) => item.slug === article.slug);
  const moreEditions = [adjacent.previous, adjacent.next, all[position + 2]]
    .filter((item): item is ArticleSummary => Boolean(item) && item?.slug !== article.slug)
    .filter((item, index, list) => list.findIndex((other) => other.slug === item.slug) === index)
    .slice(0, 3);
  const labelFor = (item: ArticleSummary) => {
    const label = sectionLabel(sectionOf(item.tags));
    return (
      <>
        {label ? <span className="label--section">{label}</span> : null}
        {label ? " · " : null}
        {czechWeekdayShort(item.date)}
      </>
    );
  };
  const topics = topicsForArticle(topicsConfig, summary);
  const base = siteUrl();
  const publication = localizedBrand(locale);
  const lastCorrection = [...(fm.corrections ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const modifiedTime = lastCorrection
    ? `${lastCorrection.date}T00:00:00Z`
    : fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`;

  return (
    <>
      {fm.generation?.package_hash ? <meta name="boardless-content-hash" content={fm.generation.package_hash} /> : null}
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

      {/* data-section lets the section bar mark this article's section. */}
      <div className="article-page" data-section={sectionKey ?? undefined}>
        <IssueMasthead
          label={isWeekly
            ? `${d.article.weeklyDigest} · ${czechNumericDate(fm.date)}`
            : [sectionLabel(sectionKey), czechWeekdayDate(fm.date)].filter(Boolean).join(" · ")}
          title={fm.title}
          dek={fm.dek}
          verification={verificationSentence(fm.generation, (fm.sources ?? []).length, d.article)}
          photo={photos.hero}
          photoAlt={photos.own ? czechDatesInText(fm.illustration.alt) : ""}
          attribution={photos.own && fm.illustration.attribution ? {
            author: fm.illustration.attribution.author,
            license: fm.illustration.attribution.license,
            sourceUrl: fm.illustration.attribution.source_url,
          } : undefined}
          locale={locale}
        />

        <SponsorBlock sponsor={fm.sponsor} />

        <div className="article-grid">
          <div className="article-grid__main">
            <EditorialHighlights whyItMatters={fm.why_it_matters} whatChanged={fm.what_changed} uncertainty={fm.uncertainty} locale={locale} />
            <article className="article-main">
              {article.fallback && (
                <p className="fallback-notice" lang={article.lang}>
                  {article.lang === "cs" ? d.article.csOnlyNotice : d.article.enOnlyNotice}
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
              <div className="article-body" lang={article.lang === "en" ? "en" : undefined}>
                <Mdx source={article.mdx} typeset={article.lang === "cs"} />
              </div>
            </article>
            <div className="issue-reference-blocks">
              <CorrectionsNotice corrections={fm.corrections} locale={locale} />
              <GlossaryBlock terms={issueGlossary} locale={locale} />
              <SourceLedger sources={fm.sources ?? []} registry={sourceRegistry} locale={locale} />
            </div>
          </div>

          {/* The side column: the neighbouring edition (Part B lists the
              day's other articles here), the practical item, Krátce, Ke
              sledování and the house creative. */}
          <aside className="article-grid__side" aria-label={d.article.sideLabel}>
            {adjacent.previous ? (
              <section className="side-module" aria-labelledby="side-previous">
                <SectionMasthead id="side-previous" kicker={d.article.previousIssue} />
                <Card
                  variant="compact"
                  href={localePath(locale, `/articles/${adjacent.previous.slug}`)}
                  title={adjacent.previous.title}
                  titleLang={adjacent.previous.lang === "en" ? "en" : undefined}
                  label={labelFor(adjacent.previous)}
                  image={adjacent.previous.heroPhoto}
                  titleSize={3}
                />
              </section>
            ) : null}
            <PracticalTip practical={readPractical(fm.practical, fm.date)} locale={locale} />
            <Dispatches items={dispatches} locale={locale} />
            <Wire items={wire} locale={locale} variant="aside" />
            <BannerSlot id="rail-square" locale={locale} />
          </aside>
        </div>

        {moreEditions.length ? (
          <section className="more-editions" aria-labelledby="more-editions">
            <SectionMasthead
              id="more-editions"
              kicker={d.article.moreEditions}
              action={{ href: localePath(locale, "/archive"), label: d.archive.title }}
            />
            <ul className="more-editions__grid">
              {moreEditions.map((item) => (
                <li key={item.slug}>
                  <Card
                    variant="cover"
                    href={localePath(locale, `/articles/${item.slug}`)}
                    title={item.title}
                    titleLang={item.lang === "en" ? "en" : undefined}
                    label={labelFor(item)}
                    dek={item.dek}
                    image={item.heroPhoto}
                    date={item.date}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
