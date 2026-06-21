import Link from "next/link";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { GlowLink } from "@/components/GlowLink";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { Wire } from "@/components/Wire";
import { getLatestArticle, listArticles } from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { githubRepo } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import type { Metadata } from "next";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang, "/") };
}

function tagLabel(tags?: string[]): string {
  return (tags?.[0] ?? "today").replace(/-/g, " ").toUpperCase();
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const d = dict(locale);
  const lp = localePrefixer(locale);

  const latest = await getLatestArticle(locale);
  const archive = (await listArticles(locale)).slice(0, 9);
  const glossary = await loadGlossary();
  const repo = githubRepo();

  if (!latest) {
    return (
      <section className="container" style={{ padding: "160px 24px" }}>
        <p className="label">{d.home.emptyKicker}</p>
        <h1>{d.home.emptyTitle}</h1>
        <p style={{ color: "var(--color-caption-gray)", maxWidth: "60ch" }}>
          {d.home.emptyBodyBefore}
          <GlowLink href={`https://github.com/${repo}`}>
            {d.home.emptyBodyRepo}
          </GlowLink>
          {d.home.emptyBodyAfter}
          <code>pnpm generate:daily</code>.
        </p>
      </section>
    );
  }

  const fm = latest.frontmatter;
  const resolvedGlossary = resolveGlossaryTerms(fm.glossary_terms, glossary);
  const hasGlossary = resolvedGlossary.length > 0;
  const hasSources = (fm.sources?.length ?? 0) > 0;
  const dispatches = fm.dispatches ?? [];
  const back = archive.filter((a) => a.slug !== latest.slug).slice(0, 8);
  const sidebarIssues = back.slice(0, 4);
  const featureIssues = back.slice(0, 4);
  const reading = readingMinutes(latest.mdx);

  return (
    <>
      <section className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <div className="edit-grid">
          {/* Lead article */}
          <article className="lead enter enter-1">
            <p className="lead__eyebrow">{tagLabel(fm.tags)}</p>
            <h1 className="lead__title">{fm.title}</h1>
            <p className="lead__dek">{fm.dek}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fm.illustration.path}
              alt={fm.illustration.alt}
              className="lead__photo"
              loading="eager"
              decoding="async"
            />
            <div className="lead__meta">
              <span>{fm.date}</span>
              <span aria-hidden>·</span>
              <span>{reading} {d.common.minutesShort} {d.common.readMinutes}</span>
            </div>
            <a href="#briefing" className="lead__cta">
              {d.home.readIssue}
            </a>
          </article>

          {/* Secondary column — dispatches as small magazine cards */}
          <div className="column enter enter-2">
            <p className="label" style={{ margin: 0 }}>{d.article.dispatchesLabel}</p>
            {dispatches.length === 0 ? (
              <p style={{ color: "var(--color-caption-gray)", margin: 0 }}>—</p>
            ) : (
              dispatches.slice(0, 4).map((dp, i) => (
                <article key={i} className="tile">
                  <p className="tile__eyebrow">{d.article.dispatchesLabel} · 0{i + 1}</p>
                  <h3 className="tile__title">{dp.title}</h3>
                  <p className="tile__body">{dp.body}</p>
                  {dp.source_url && (
                    <p className="tile__meta">
                      <a href={dp.source_url} target="_blank" rel="noreferrer noopener">
                        {d.article.dispatchSource} ↗
                      </a>
                    </p>
                  )}
                </article>
              ))
            )}
          </div>

          {/* Right sidebar — Back issues list */}
          <aside className="column enter enter-3">
            <p className="label" style={{ margin: 0 }}>{d.home.backIssues}</p>
            {sidebarIssues.map((a) => (
              <article key={a.slug} className="tile">
                <p className="tile__eyebrow">{a.date}</p>
                <h3 className="tile__title">
                  <Link href={lp(`/articles/${a.slug}`)}>{a.title}</Link>
                </h3>
              </article>
            ))}
            <Link href={lp("/archive")} className="label" style={{ marginTop: 4 }}>
              {d.nav.archive} →
            </Link>
          </aside>
        </div>
      </section>

      {/* Feature row — wider grid of recent issues */}
      {featureIssues.length > 0 && (
        <section className="container">
          <div className="feature-row">
            <header className="feature-row__title">
              <p className="label" style={{ margin: 0 }}>{d.home.recentIssues}</p>
              <Link href={lp("/archive")} className="label">{d.nav.archive} →</Link>
            </header>
            {featureIssues.map((a) => (
              <Link key={a.slug} href={lp(`/articles/${a.slug}`)} className="feature-tile">
                <span aria-hidden className="feature-tile__photo" />
                <span className="feature-tile__date">{a.date}</span>
                <span className="feature-tile__title">{a.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Briefing — full article body, with secondary blocks below */}
      <section className="container" style={{ paddingTop: 64, paddingBottom: 32 }}>
        <div className="reading" id="briefing" style={{ scrollMarginTop: 80 }}>
          <p className="label" style={{ marginBottom: 8 }}>{d.home.briefing}</p>
          <EditorsNote note={fm.editors_note} locale={locale} />
          <Mdx source={latest.mdx} />
          <Wire items={fm.wire ?? []} locale={locale} />
          {hasGlossary && (
            <GlossaryBlock terms={resolvedGlossary} locale={locale} />
          )}
          {hasSources && (
            <SourcesBlock sources={fm.sources ?? []} locale={locale} />
          )}
        </div>
      </section>
    </>
  );
}
