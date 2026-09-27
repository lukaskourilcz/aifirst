import { getArticle, listArticles } from "@/lib/content";
import { editorialHold } from "@/lib/editorial-holds";
import { editionMarkdown } from "@/lib/distribution/discovery";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

// The edition as plain Markdown. Readers reach it at /articles/<slug>.md;
// middleware.ts rewrites that URL here, so this internal path never appears
// in a link (issue #99).
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listArticles(DEFAULT_LOCALE)).map((a) => ({ slug: a.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = editorialHold(slug) ? null : await getArticle(slug, DEFAULT_LOCALE);
  if (!article) return new Response("Not found", { status: 404 });
  return new Response(editionMarkdown(article), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex",
      Link: `</articles/${slug}>; rel="canonical"`,
    },
  });
}
