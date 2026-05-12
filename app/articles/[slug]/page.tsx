import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CoverFrame } from "@/components/CoverFrame";
import { DataStrip } from "@/components/DataStrip";
import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { Mdx } from "@/components/Mdx";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedIssues } from "@/components/RelatedIssues";
import { SourcesBlock } from "@/components/SourcesBlock";
import { TagChip } from "@/components/TagChip";
import { WeeklyBadge } from "@/components/WeeklyBadge";
import { Wire } from "@/components/Wire";
import {
  getArticle,
  listArticles,
  relatedArticles,
  type ArticleSummary,
} from "@/lib/content";
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
    title: article.frontmatter.title,
    description: article.frontmatter.dek,
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.dek,
      images: [{ url: article.frontmatter.illustration.path }],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const all = await listArticles();
  const summary: ArticleSummary = {
    slug: article.slug,
    date: article.frontmatter.date,
    title: article.frontmatter.title,
    tags: article.frontmatter.tags,
  };
  const related = relatedArticles(summary, all, 3);
  const isWeekly = (article.frontmatter.type ?? "daily") === "weekly";
  const titlesBySlug = new Map(all.map((a) => [a.slug, a.title]));
  const glossary = await loadGlossary();
  const issueGlossary = (article.frontmatter.glossary_terms ?? [])
    .map((name) => lookupTerm(name, glossary))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      <ReadingProgress />
      <DataStrip
        date={article.frontmatter.date}
        sourceCount={article.frontmatter.sources?.length ?? 0}
        tags={article.frontmatter.tags}
        signal={article.frontmatter.signal_strength}
        readingMinutes={readingMinutes(article.mdx)}
      />
      <section className="container" style={{ paddingTop: 32 }}>
        <div className="enter enter-1">
          <CoverFrame
            src={article.frontmatter.illustration.path}
            alt={article.frontmatter.illustration.alt}
            priority
          />
        </div>
        <div className="reading" style={{ paddingTop: 56, paddingBottom: 32 }}>
          <p
            className="label label--accent"
            style={{
              color: isWeekly ? "var(--accent-magenta)" : undefined,
            }}
          >
            {isWeekly ? "weekly digest" : ""}{" "}
            {isWeekly ? "·" : ""} {article.frontmatter.date}
          </p>
          <h1>{article.frontmatter.title}</h1>
          <p
            style={{
              fontSize: "1.3rem",
              color: "var(--ink-muted)",
              marginBottom: "2em",
              lineHeight: 1.45,
            }}
          >
            {article.frontmatter.dek}
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 2.5em",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {(article.frontmatter.tags ?? []).map((t) => (
              <li key={t}>
                <TagChip tag={t} />
              </li>
            ))}
          </ul>
          {isWeekly && article.frontmatter.digest && (
            <WeeklyBadge
              from={article.frontmatter.digest.from}
              to={article.frontmatter.digest.to}
              coveredSlugs={article.frontmatter.digest.covered_slugs}
              titlesBySlug={titlesBySlug}
            />
          )}
          <EditorsNote note={article.frontmatter.editors_note} />
          <Mdx source={article.mdx} />
          <Dispatches items={article.frontmatter.dispatches ?? []} />
          <Wire items={article.frontmatter.wire ?? []} />
          <GlossaryBlock terms={issueGlossary} />
          <SourcesBlock sources={article.frontmatter.sources ?? []} />
          <p
            style={{
              marginTop: 32,
              textAlign: "right",
            }}
          >
            <a
              href={`/articles/${article.slug}/print`}
              className="label"
              target="_blank"
              rel="noopener"
            >
              ↗ print view
            </a>
          </p>
          <RelatedIssues items={related} />
        </div>
      </section>
    </>
  );
}
