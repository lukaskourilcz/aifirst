import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Mdx } from "@/components/Mdx";
import { getArticle } from "@/lib/content";
import { loadGlossary, lookupTerm, glossaryDefinition } from "@/lib/glossary";
import { readingMinutes } from "@/lib/text";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

// Rendered on demand (low-traffic, opened in a new tab) so it can read the
// ?lang= the article page links with.
export const dynamic = "force-dynamic";

function resolveLocale(lang?: string): Locale {
  return lang && isLocale(lang) ? lang : DEFAULT_LOCALE;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = resolveLocale((await searchParams).lang);
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return {
    title: `${article.frontmatter.title} (print)`,
    description: article.frontmatter.dek,
    robots: { index: false },
  };
}

export default async function PrintArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const locale = resolveLocale((await searchParams).lang);
  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const t = dict(locale).article;
  const common = dict(locale).common;
  const glossary = await loadGlossary();
  const issueGlossary = (article.frontmatter.glossary_terms ?? [])
    .map((n) => lookupTerm(n, glossary))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <article className="print-layout">
      <header className="print-masthead">
        <div className="print-masthead-row">
          <span>aifirst.</span>
          <span>{common.issue} {article.frontmatter.date}</span>
        </div>
        <div className="print-masthead-row">
          <span>
            {article.frontmatter.tags?.slice(0, 4).join(" · ")}
          </span>
          <span>{readingMinutes(article.mdx)} {common.minutesShort}</span>
        </div>
      </header>

      <h1 className="print-title">{article.frontmatter.title}</h1>
      <p className="print-dek">{article.frontmatter.dek}</p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.frontmatter.illustration.path}
        alt={article.frontmatter.illustration.alt}
        className="print-illustration"
      />
      <p className="print-caption">
        {article.frontmatter.illustration.alt}
      </p>

      {article.frontmatter.editors_note && (
        <aside className="print-note">
          <strong>{t.editorsNote}.</strong>{" "}
          {article.frontmatter.editors_note}
        </aside>
      )}

      <div className="print-body">
        <Mdx source={article.mdx} />
      </div>

      {issueGlossary.length > 0 && (
        <section className="print-glossary">
          <h2>{t.glossaryHeading}</h2>
          <dl>
            {issueGlossary.map((g) => (
              <div key={g.term} className="print-glossary-row">
                <dt>{g.term}</dt>
                <dd>{glossaryDefinition(g, locale)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {article.frontmatter.sources && article.frontmatter.sources.length > 0 && (
        <section className="print-sources">
          <h2>{t.sources}</h2>
          <ol>
            {article.frontmatter.sources.map((s) => (
              <li key={s.id}>
                <span className="print-source-title">{s.title}</span>{" "}
                — <span className="print-source-url">{s.url}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="print-footer">
        <p>
          aifirst &middot; {t.printTagline} &middot;{" "}
          {localePath(locale, `/articles/${article.slug}`)}
        </p>
        <p className="screen-only">
          <Link href={localePath(locale, `/articles/${article.slug}`)}>
            ← {t.backToScreen}
          </Link>
        </p>
      </footer>
    </article>
  );
}
