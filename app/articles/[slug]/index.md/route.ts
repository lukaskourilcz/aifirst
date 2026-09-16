import { editorialHold } from "@/lib/editorial-holds";
import { getArticle, listArticles } from "@/lib/content";
import { buildArticleMarkdown } from "@/lib/distribution/llms";

// One prerendered markdown document per published edition. The reader-facing
// URL is /articles/<slug>.md, which next.config.mjs rewrites here: an App
// Router segment is only dynamic when it ends in `]`, so `[slug].md` would be
// a literal folder name rather than a parameter.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  // Legacy English-only issues come back as fallbacks on a Czech-only site and
  // are excluded here for the same reason the feeds exclude them.
  const published = (await listArticles("cs")).filter((summary) => !summary.fallback);
  return published.map((summary) => ({ slug: summary.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // listArticles already drops held editions, so this guard is belt and
  // braces: getArticle does not check the hold list on its own.
  if (editorialHold(slug)) return new Response(null, { status: 404 });
  const article = await getArticle(slug, "cs");
  if (!article) return new Response(null, { status: 404 });
  return new Response(buildArticleMarkdown(article, "cs"), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
