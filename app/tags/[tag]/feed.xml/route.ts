import {
  getArticle,
  listArticlesByTag,
  listTagsByFrequency,
} from "@/lib/content";
import { siteUrl } from "@/lib/config";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
      `  <entry>
    <title>${escapeXml(article.frontmatter.title)}</title>
    <link href="${base}/articles/${article.slug}"/>
    <id>${base}/articles/${article.slug}</id>
    <updated>${article.frontmatter.date}T06:00:00Z</updated>
    <summary>${escapeXml(article.frontmatter.dek)}</summary>
    <category term="${escapeXml(tag)}"/>
  </entry>`,
    );
  }

  const updated = issues[0]?.date
    ? `${issues[0].date}T06:00:00Z`
    : new Date().toISOString();

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>aifirst — #${escapeXml(tag)}</title>
  <link href="${base}/tags/${encodeURIComponent(tag)}" rel="alternate"/>
  <link href="${base}/tags/${encodeURIComponent(tag)}/feed.xml" rel="self"/>
  <id>${base}/tags/${encodeURIComponent(tag)}</id>
  <updated>${updated}</updated>
${entries.join("\n")}
</feed>
`;

  return new Response(atom, {
    headers: { "content-type": "application/atom+xml; charset=utf-8" },
  });
}
