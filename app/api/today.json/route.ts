import { getLatestArticle } from "@/lib/content";
import { readingMinutes } from "@/lib/text";

export const dynamic = "force-static";

export async function GET() {
  const latest = await getLatestArticle();
  if (!latest) {
    return Response.json({ status: "no-issue" }, { status: 404 });
  }
  const payload = {
    status: "ok",
    issue: {
      slug: latest.slug,
      date: latest.frontmatter.date,
      title: latest.frontmatter.title,
      dek: latest.frontmatter.dek,
      tags: latest.frontmatter.tags,
      signal_strength: latest.frontmatter.signal_strength ?? null,
      reading_minutes: readingMinutes(latest.mdx),
      illustration: latest.frontmatter.illustration,
      sources: latest.frontmatter.sources ?? [],
      dispatches: latest.frontmatter.dispatches ?? [],
      wire: latest.frontmatter.wire ?? [],
    },
  };
  return Response.json(payload, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
