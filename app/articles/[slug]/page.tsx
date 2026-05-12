import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CoverFrame } from "@/components/CoverFrame";
import { DataStrip } from "@/components/DataStrip";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { getArticle, listArticles } from "@/lib/content";

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

  return (
    <>
      <DataStrip
        date={article.frontmatter.date}
        sourceCount={article.frontmatter.sources?.length ?? 0}
        tags={article.frontmatter.tags}
      />
      <section className="container" style={{ paddingTop: 32 }}>
        <div className="enter enter-1">
          <CoverFrame
            src={article.frontmatter.illustration.path}
            alt={article.frontmatter.illustration.alt}
            priority
          />
        </div>
        <div className="reading" style={{ paddingTop: 56, paddingBottom: 64 }}>
          <p className="label label--accent">{article.frontmatter.date}</p>
          <h1>{article.frontmatter.title}</h1>
          <p
            style={{
              fontSize: "1.3rem",
              color: "var(--ink-muted)",
              marginBottom: "2.5em",
              lineHeight: 1.45,
            }}
          >
            {article.frontmatter.dek}
          </p>
          <Mdx source={article.mdx} />
          <SourcesBlock sources={article.frontmatter.sources ?? []} />
        </div>
      </section>
    </>
  );
}
