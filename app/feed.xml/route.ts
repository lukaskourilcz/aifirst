import { listArticles, getArticle } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { atomDocument, atomEntry, feedUpdated } from "@/lib/feed";

export const dynamic = "force-static";

export async function GET() {
  const base = siteUrl();
  const summaries = await listArticles();
  const entries: string[] = [];
  for (const s of summaries.slice(0, 50)) {
    const article = await getArticle(s.slug);
    if (!article) continue;
    entries.push(
      atomEntry({
        title: article.frontmatter.title,
        url: `${base}/articles/${article.slug}`,
        date: article.frontmatter.date,
        summary: article.frontmatter.dek,
      }),
    );
  }

  const atom = atomDocument({
    title: "aifirst — a daily AI tech magazine",
    alternateHref: `${base}/`,
    selfHref: `${base}/feed.xml`,
    id: `${base}/`,
    updated: feedUpdated(summaries[0]?.date),
    entries,
  });

  return new Response(atom, {
    headers: { "content-type": "application/atom+xml; charset=utf-8" },
  });
}
