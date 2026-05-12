import { notFound } from "next/navigation";
import { CoverFrame } from "@/components/CoverFrame";
import { DataStrip } from "@/components/DataStrip";
import { getArticle, listArticles } from "@/lib/content";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const all = await listArticles();
  return all.map((a) => ({ slug: a.slug }));
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
      />
      <section className="container" style={{ paddingTop: 32 }}>
        <CoverFrame
          src={article.frontmatter.illustration.path}
          alt={article.frontmatter.illustration.alt}
        />
        <div className="reading" style={{ paddingTop: 48, paddingBottom: 96 }}>
          <p className="label">{article.frontmatter.date}</p>
          <h1>{article.frontmatter.title}</h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--ink-muted)",
              marginBottom: "2.5em",
            }}
          >
            {article.frontmatter.dek}
          </p>
          <article dangerouslySetInnerHTML={{ __html: article.html }} />
        </div>
      </section>
    </>
  );
}
