import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { GlowLink } from "@/components/GlowLink";
import { HomeContents } from "@/components/HomeContents";
import { HomeCover } from "@/components/HomeCover";
import { IssueCard } from "@/components/IssueCard";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { Wire } from "@/components/Wire";
import { getLatestArticle, listArticles } from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { githubRepo } from "@/lib/config";
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const d = dict(locale);
  const lp = localePrefixer(locale);

  const latest = await getLatestArticle(locale);
  const archive = (await listArticles(locale)).slice(0, 7);
  const glossary = await loadGlossary();
  const repo = githubRepo();

  if (!latest) {
    return (
      <section className="container" style={{ padding: "160px 24px" }}>
        <p className="label label--accent">{d.home.emptyKicker}</p>
        <h1>{d.home.emptyTitle}</h1>
        <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
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
  const hasDispatches = (fm.dispatches?.length ?? 0) > 0;
  const hasWire = (fm.wire?.length ?? 0) > 0;
  const hasGlossary = resolvedGlossary.length > 0;
  const hasSources = (fm.sources?.length ?? 0) > 0;

  const backIssues = archive.filter((a) => a.slug !== latest.slug).slice(0, 6);

  return (
    <>
      <HomeCover
        date={fm.date}
        title={fm.title}
        dek={fm.dek}
        tags={fm.tags}
        illustration={{ path: fm.illustration.path, alt: fm.illustration.alt }}
        locale={locale}
      >
        <a href="#briefing" className="home-cover__cta">
          {d.home.readIssue} <span aria-hidden>↓</span>
        </a>
      </HomeCover>

      <HomeContents
        hasDispatches={hasDispatches}
        hasWire={hasWire}
        hasGlossary={hasGlossary}
        hasSources={hasSources}
        locale={locale}
      />

      <section className="container" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="article-with-aside">
          <article className="article-with-aside__main" id="briefing" style={{ scrollMarginTop: 80 }}>
            <EditorsNote note={fm.editors_note} locale={locale} />
            <Mdx source={latest.mdx} />
          </article>
          {hasDispatches && (
            <aside
              className="article-with-aside__side"
              id="dispatches"
              style={{ scrollMarginTop: 80 }}
              aria-label={d.article.dispatchesLabel}
            >
              <Dispatches items={fm.dispatches ?? []} locale={locale} variant="aside" />
            </aside>
          )}
        </div>

        <div className="reading">
          {hasWire && (
            <div id="wire" style={{ scrollMarginTop: 80 }}>
              <Wire items={fm.wire ?? []} locale={locale} />
            </div>
          )}
          {hasGlossary && (
            <div id="glossary" style={{ scrollMarginTop: 80 }}>
              <GlossaryBlock terms={resolvedGlossary} locale={locale} />
            </div>
          )}
          {hasSources && (
            <div id="sources" style={{ scrollMarginTop: 80 }}>
              <SourcesBlock sources={fm.sources ?? []} locale={locale} />
            </div>
          )}
        </div>
      </section>

      {backIssues.length > 0 && (
        <section className="container" style={{ paddingTop: 24, paddingBottom: 64 }}>
          <header
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              paddingBottom: 16,
              marginBottom: 20,
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <p className="label label--accent" style={{ margin: 0 }}>
              {d.home.backIssues}
            </p>
            <GlowLink href={lp("/archive")}>
              <span className="label">{d.nav.archive} →</span>
            </GlowLink>
          </header>
          <ul className="back-issues__grid">
            {backIssues.map((a, i) => (
              <li key={a.slug}>
                <IssueCard
                  href={lp(`/articles/${a.slug}`)}
                  date={a.date}
                  title={a.title}
                  index={i + 1}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
