import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { Mdx } from "@/components/Mdx";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedIssues } from "@/components/RelatedIssues";
import { SourcesBlock } from "@/components/SourcesBlock";
import { Wire } from "@/components/Wire";
import { WeeklyBadge } from "@/components/WeeklyBadge";
import {
  getArticle,
  listArticles,
  relatedArticles,
  type ArticleSummary,
} from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { relatedBySimilarity } from "@/lib/embeddings";
import { readingMinutes } from "@/lib/text";
import { type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";

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
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.dek,
    alternates: localeAlternates(lang, articlePath),
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.dek,
      images: [{ url: article.frontmatter.illustration.path }],
    },
  };
}

function eyebrow(tags?: string[]): string {
  return (tags?.[0] ?? "today").replace(/-/g, " ");
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
  const issueGlossary = resolveGlossaryTerms(
    article.frontmatter.glossary_terms,
    glossary,
  );
  const fm = article.frontmatter;
  const dispatches = (fm.dispatches ?? []).slice(0, 6);
  const reading = readingMinutes(article.mdx);

  return (
    <>
      <ReadingProgress />

      {/* Hero panel */}
      <section className="hero enter enter-1">
        <div>
          <p className="hero__eyebrow">
            {isWeekly ? d.article.weeklyDigest : eyebrow(fm.tags)}
          </p>
          <h1 className="hero__title">{fm.title}</h1>
          <p className="hero__dek">{fm.dek}</p>
          <div className="hero__meta">
            <span>{fm.date}</span>
            <span aria-hidden>·</span>
            <span>{reading} {d.common.minutesShort} {d.common.readMinutes}</span>
            {(fm.tags ?? []).slice(0, 3).map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fm.illustration.path}
          alt={fm.illustration.alt}
          className="hero__photo"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </section>

      {/* Body + dispatches sidebar */}
      <section className="article-with-aside enter enter-2">
        <article className="article-with-aside__main">
          {article.fallback && (
            <p
              className="label"
              style={{
                padding: "8px 12px",
                margin: "0 0 24px",
                borderLeft: "3px solid var(--color-blueprint-blue)",
                background: "var(--color-paper)",
                borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
                color: "var(--color-ink-black)",
              }}
            >
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
            {dispatches.length > 0 && (
              <>
                <p className="eyebrow" style={{ marginBottom: 12 }}>
                  {d.article.dispatchesLabel}
                </p>
                <div className="dispatches--aside">
                  {dispatches.map((dp, i) => (
                    <article key={i} className="dispatch-card">
                      <p className="dispatch-card__eyebrow">
                        {d.article.dispatchesLabel} · 0{i + 1}
                      </p>
                      <h3 className="dispatch-card__title">{dp.title}</h3>
                      <p className="dispatch-card__body">{dp.body}</p>
                      {dp.source_url && (
                        <a
                          href={dp.source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="dispatch-card__source"
                        >
                          {d.article.dispatchSource} ↗
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
            <Wire items={fm.wire ?? []} locale={locale} variant="aside" />
          </aside>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <GlossaryBlock terms={issueGlossary} locale={locale} />
        <SourcesBlock sources={fm.sources ?? []} locale={locale} />
        <p style={{ marginTop: 24, textAlign: "right" }}>
          <a
            href={`/articles/${article.slug}/print?lang=${locale}`}
            className="label"
            target="_blank"
            rel="noopener"
          >
            ↗ {d.article.printView}
          </a>
        </p>
        <RelatedIssues items={related} locale={locale} />
      </section>
    </>
  );
}
