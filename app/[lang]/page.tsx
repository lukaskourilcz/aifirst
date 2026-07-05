import Link from "next/link";
import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { Wire } from "@/components/Wire";
import {
  getArticle,
  getLatestArticle,
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
  const archive = (await listArticles(locale)).slice(0, 9);
  const glossary = await loadGlossary();
  const repo = githubRepo();

  // The hero panel must always carry a real picture. `resolveHeroPhoto`
  // prefers the article's own generated illustration, then a cached og:image
  // from its sources; we walk back through the archive as a last resort so
  // the home page never opens with a blank hero.
  async function pickLead(): Promise<{
    article: NonNullable<typeof latest>;
    heroPhoto: string;
  } | null> {
    if (!latest) return null;
    const own = resolveHeroPhoto(latest.frontmatter);
    if (own) return { article: latest, heroPhoto: own };
    const candidates = await listArticles(locale);
    for (const summary of candidates.slice(1)) {
      const a = await getArticle(summary.slug, locale);
      if (!a) continue;
      const img = resolveHeroPhoto(a.frontmatter);
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
          {d.home.emptyBody}
        </p>
        <a
          href={`https://github.com/${repo}`}
          className="ghost"
          target="_blank"
          rel="noreferrer noopener"
          style={{ marginTop: 16 }}
        >
          {d.home.emptyRepoCta} ↗
        </a>
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
          <p className="hero__eyebrow">
            {(fm.type ?? "daily") === "weekly"
              ? d.article.weeklyDigest
              : d.home.todaysBriefing}
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
            <Dispatches items={dispatches} locale={locale} variant="aside" />
            <Wire items={fm.wire ?? []} locale={locale} variant="aside" />
          </aside>
        )}
      </section>

      {/* Secondary blocks (Glossary + Sources) below the article */}
      <section style={{ marginTop: "var(--block-gap)" }}>
        {hasGlossary && (
          <GlossaryBlock terms={resolvedGlossary} locale={locale} />
        )}
        {hasSources && (
          <SourcesBlock sources={fm.sources ?? []} locale={locale} />
        )}
      </section>

      {/* Recent issues feed */}
      {back.length > 0 && (
        <section style={{ marginTop: "var(--section-gap)" }}>
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
