import {
  getArticle,
  listArticlesByTag,
  listTagsByFrequency,
} from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { atomDocument, atomEntry, feedUpdated } from "@/lib/feed";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const tags = await listTagsByFrequency();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> },
) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const base = siteUrl();
  const issues = await listArticlesByTag(tag);

  const entries: string[] = [];
  for (const s of issues.slice(0, 50)) {
    const article = await getArticle(s.slug);
    if (!article) continue;
    entries.push(
      atomEntry({
        title: article.frontmatter.title,
        url: `${base}/articles/${article.slug}`,
        date: article.frontmatter.date,
        summary: article.frontmatter.dek,
        category: tag,
      }),
    );
  }

  const atom = atomDocument({
    title: `aifirst — #${tag}`,
    alternateHref: `${base}/tags/${encodeURIComponent(tag)}`,
    selfHref: `${base}/tags/${encodeURIComponent(tag)}/feed.xml`,
    id: `${base}/tags/${encodeURIComponent(tag)}`,
    updated: feedUpdated(issues[0]?.date),
    entries,
  });

  return new Response(atom, {
    headers: { "content-type": "application/atom+xml; charset=utf-8" },
  });
}
