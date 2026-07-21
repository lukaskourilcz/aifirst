import type { Metadata } from "next";
import { PrintArticle } from "@/components/PrintArticle";
import { getArticle, listArticles } from "@/lib/content";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await listArticles("en")).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug, "en");
  return article ? { title: `${article.frontmatter.title} (print)`, description: article.frontmatter.dek, robots: { index: false } } : {};
}

export default async function PrintArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <PrintArticle slug={(await params).slug} locale="en" />;
}
