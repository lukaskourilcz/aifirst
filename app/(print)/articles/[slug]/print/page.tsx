import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Mdx } from "@/components/Mdx";
import { getArticle, listArticles } from "@/lib/content";
import { loadGlossary, lookupTerm } from "@/lib/glossary";
import { readingMinutes } from "@/lib/text";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const all = await listArticles();
  return all.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.frontmatter.title} (print)`,
    description: article.frontmatter.dek,
    robots: { index: false },
  };
}

export default async function PrintArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const glossary = await loadGlossary();
  const issueGlossary = (article.frontmatter.glossary_terms ?? [])
    .map((n) => lookupTerm(n, glossary))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <article className="print-layout">
      <header className="print-masthead">
        <div className="print-masthead-row">
          <span>aifirst.</span>
          <span>issue {article.frontmatter.date}</span>
        </div>
        <div className="print-masthead-row">
          <span>
            {article.frontmatter.tags?.slice(0, 4).join(" · ")}
          </span>
          <span>{readingMinutes(article.mdx)} min read</span>
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
          <strong>Editor&rsquo;s note.</strong>{" "}
          {article.frontmatter.editors_note}
        </aside>
      )}

      <div className="print-body">
        <Mdx source={article.mdx} />
      </div>

      {issueGlossary.length > 0 && (
        <section className="print-glossary">
          <h2>Glossary</h2>
          <dl>
            {issueGlossary.map((t) => (
              <div key={t.term} className="print-glossary-row">
                <dt>{t.term}</dt>
                <dd>{t.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {article.frontmatter.sources && article.frontmatter.sources.length > 0 && (
        <section className="print-sources">
          <h2>Sources</h2>
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
          aifirst &middot; an AI-written daily magazine &middot;{" "}
          /articles/{article.slug}
        </p>
        <p className="screen-only">
          <Link href={`/articles/${article.slug}`}>← back to screen view</Link>
        </p>
      </footer>
    </article>
  );
}
