import Link from "next/link";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { GlowLink } from "@/components/GlowLink";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { Wire } from "@/components/Wire";
import { getArticle, getLatestArticle, listArticles } from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { githubRepo } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import { ogImageFor } from "@/lib/og";
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

function eyebrow(tags?: string[]): string {
  return (tags?.[0] ?? "today").replace(/-/g, " ");
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

  // The hero panel must always carry a real picture. The local illustration
  // is a flat placeholder until a real image provider is wired, so we look
  // for a cached og:image among the article's own sources first, then fall
  // back to a recent issue that does have one.
  async function pickHeroPhoto(
    article: NonNullable<typeof latest>,
  ): Promise<string | null> {
    for (const s of article.frontmatter.sources ?? []) {
      const img = ogImageFor(s.url);
      if (img) return img;
    }
    for (const w of article.frontmatter.wire ?? []) {
      const img = ogImageFor(w.url);
      if (img) return img;
    }
    return null;
  }

  async function pickLead(): Promise<{
    article: NonNullable<typeof latest>;
    heroPhoto: string;
  } | null> {
    if (!latest) return null;
    const own = await pickHeroPhoto(latest);
    if (own) return { article: latest, heroPhoto: own };
    // Walk back through the archive (newest first) for an issue with a
    // usable picture, so the home page never opens with a blank hero.
    const candidates = await listArticles(locale);
    for (const summary of candidates.slice(1)) {
      const a = await getArticle(summary.slug, locale);
      if (!a) continue;
      const img = await pickHeroPhoto(a);
      if (img) return { article: a, heroPhoto: img };
    }
    return null;
  }

  const lead = await pickLead();

  if (!latest || !lead) {
    return (
      <section style={{ padding: "120px 0" }}>
        <p className="eyebrow">{d.home.emptyKicker}</p>
        <h1>{d.home.emptyTitle}</h1>
        <p style={{ color: "var(--color-slate)", maxWidth: "60ch" }}>
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

  const fm = lead.article.frontmatter;
  const heroPhoto = lead.heroPhoto;
  const resolvedGlossary = resolveGlossaryTerms(fm.glossary_terms, glossary);
  const hasGlossary = resolvedGlossary.length > 0;
  const hasSources = (fm.sources?.length ?? 0) > 0;
  const dispatches = (fm.dispatches ?? []).slice(0, 6);
  const back = archive.filter((a) => a.slug !== lead.article.slug).slice(0, 6);
  const reading = readingMinutes(lead.article.mdx);

  return (
    <>
      {/* Hero panel — today's lead */}
      <section className="hero enter enter-1">
        <div>
          <p className="hero__eyebrow">{eyebrow(fm.tags)}</p>
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
          src={heroPhoto}
          alt={fm.illustration.alt || fm.title}
          className="hero__photo"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </section>

      {/* Article body + dispatches sidebar (sidebar's grid cell ends with the
          article's intrinsic height, so the sticky sidebar releases at the
          article's lowest point — no overflow below the body). */}
      <section className="article-with-aside enter enter-2">
        <article className="article-with-aside__main" id="briefing">
          <EditorsNote note={fm.editors_note} locale={locale} />
          <div className="article-body">
            <Mdx source={lead.article.mdx} />
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

      {/* Secondary blocks (Glossary + Sources) below the article */}
      <section style={{ marginTop: 32 }}>
        {hasGlossary && (
          <GlossaryBlock terms={resolvedGlossary} locale={locale} />
        )}
        {hasSources && (
          <SourcesBlock sources={fm.sources ?? []} locale={locale} />
        )}
      </section>

      {/* Recent issues feed */}
      {back.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div className="section-head">
            <h2 className="section-head__title">{d.home.recentIssues}</h2>
            <Link href={lp("/archive")} className="label">
              {d.nav.archive} →
            </Link>
          </div>
          <ul
            className="card-grid card-grid--feed"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {back.map((a) => (
              <li key={a.slug}>
                <Link href={lp(`/articles/${a.slug}`)} className="post-card">
                  <div className="post-card__top">
                    <span aria-hidden className="post-card__thumb" />
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
