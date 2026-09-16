import { getArticle, listArticles } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { DEFAULT_LOCALE, localePath } from "@/lib/i18n/config";
import { articlesInNewsWindow, newsSitemapDocument, type NewsSitemapEntry } from "@/lib/news-sitemap";

export const dynamic = "force-static";

export async function GET() {
  const base = siteUrl();
  const recent = articlesInNewsWindow(await listArticles(DEFAULT_LOCALE));
  const entries: NewsSitemapEntry[] = [];
  for (const summary of recent) {
    const article = await getArticle(summary.slug, DEFAULT_LOCALE);
    if (!article) continue;
    entries.push({
      url: `${base}${localePath(DEFAULT_LOCALE, `/articles/${summary.slug}`)}`,
      title: article.frontmatter.title,
      publishedAt: article.frontmatter.generation?.generated_at ?? article.frontmatter.date,
      language: article.lang,
    });
  }
  return new Response(newsSitemapDocument(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
