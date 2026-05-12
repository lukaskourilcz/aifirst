import { listArticles, getArticle } from "@/lib/content";

export const dynamic = "force-static";

const BASE = "https://aifirst.example";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const summaries = await listArticles();
  const items: string[] = [];
  for (const s of summaries.slice(0, 50)) {
    const article = await getArticle(s.slug);
    if (!article) continue;
    items.push(
      `  <entry>
    <title>${escapeXml(article.frontmatter.title)}</title>
    <link href="${BASE}/articles/${article.slug}"/>
    <id>${BASE}/articles/${article.slug}</id>
    <updated>${article.frontmatter.date}T06:00:00Z</updated>
    <summary>${escapeXml(article.frontmatter.dek)}</summary>
  </entry>`,
    );
  }

  const updated = summaries[0]?.date
    ? `${summaries[0].date}T06:00:00Z`
    : new Date().toISOString();

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>aifirst — a daily AI tech magazine</title>
  <link href="${BASE}/" rel="alternate"/>
  <link href="${BASE}/feed.xml" rel="self"/>
  <id>${BASE}/</id>
  <updated>${updated}</updated>
${items.join("\n")}
</feed>
`;

  return new Response(atom, {
    headers: { "content-type": "application/atom+xml; charset=utf-8" },
  });
}
