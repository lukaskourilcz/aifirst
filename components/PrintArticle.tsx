import Link from "next/link";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/Mdx";
import { getArticle, resolveHeroPhoto } from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms, glossaryDefinition } from "@/lib/glossary";
import { readingMinutes } from "@/lib/text";
import { localePath, type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import { HtmlLang } from "@/components/HtmlLang";

export async function PrintArticle({ slug, locale }: { slug: string; locale: Locale }) {
  const article = await getArticle(slug, locale);
  if (!article) notFound();
  const t = dict(locale).article;
  const common = dict(locale).common;
  const issueGlossary = resolveGlossaryTerms(article.frontmatter.glossary_terms, await loadGlossary());
  const heroPhoto = resolveHeroPhoto(article.frontmatter);

  return (
    <>
      {locale !== "en" ? <HtmlLang locale={locale} /> : null}
      <article className="print-layout">
        <header className="print-masthead">
          <div className="print-masthead-row"><span>{brand.name}.</span><span>{common.issue} {article.frontmatter.date}</span></div>
          <div className="print-masthead-row"><span>{article.frontmatter.tags?.slice(0, 4).join(" · ")}</span><span>{readingMinutes(article.mdx)} {common.minutesShort}</span></div>
        </header>

        <h1 className="print-title">{article.frontmatter.title}</h1>
        <p className="print-dek">{article.frontmatter.dek}</p>

        {heroPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroPhoto} alt={article.frontmatter.illustration.alt} className="print-illustration" />
            <p className="print-caption">{article.frontmatter.illustration.alt}</p>
          </>
        ) : null}
        {article.frontmatter.editors_note ? <aside className="print-note"><strong>{t.editorsNote}.</strong>{" "}{article.frontmatter.editors_note}</aside> : null}
        <div className="print-body"><Mdx source={article.mdx} /></div>

        {issueGlossary.length > 0 ? <section className="print-glossary"><h2>{t.glossaryHeading}</h2><dl>{issueGlossary.map((term) => <div key={term.term} className="print-glossary-row"><dt>{term.term}</dt><dd>{glossaryDefinition(term, locale)}</dd></div>)}</dl></section> : null}
        {article.frontmatter.sources.length > 0 ? <section className="print-sources"><h2>{t.sources}</h2><ol>{article.frontmatter.sources.map((source) => <li key={source.id}><span className="print-source-title">{source.title}</span>{" — "}<span className="print-source-url">{source.url}</span></li>)}</ol></section> : null}

        <footer className="print-footer">
          <p>{brand.name} &middot; {t.printTagline} &middot; {localePath(locale, `/articles/${article.slug}`)}</p>
          <p className="screen-only"><Link href={localePath(locale, `/articles/${article.slug}`)}>← {t.backToScreen}</Link></p>
        </footer>
      </article>
    </>
  );
}
