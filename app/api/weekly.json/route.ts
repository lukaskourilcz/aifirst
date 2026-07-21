import { listArticles } from "@/lib/content";
import { brand } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const issues = (await listArticles()).filter((article) => article.type === "weekly");
  return Response.json({
    schema_version: 1,
    publication: brand.name,
    issues: issues.map((article) => ({
      slug: article.slug,
      date: article.date,
      title: article.title,
      dek: article.dek,
      tags: article.tags ?? [],
      language: article.lang ?? "en",
      url: `/articles/${article.slug}`,
    })),
  });
}
