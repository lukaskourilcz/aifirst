import { getLatestArticle } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { readingMinutes } from "@/lib/text";

export const dynamic = "force-static";

export async function GET() {
  const latest = await getLatestArticle();
  if (!latest) {
    return Response.json({ status: "no-issue" }, { status: 404 });
  }
  const fm = latest.frontmatter;
  const type = fm.type ?? "daily";
  const base = siteUrl();
  const payload = {
    status: "ok",
    issue: {
      type,
      slug: latest.slug,
      date: fm.date,
      title: fm.title,
      dek: fm.dek,
      tags: fm.tags,
      url: `${base}/articles/${latest.slug}`,
      signal_strength: fm.signal_strength ?? null,
      reading_minutes: readingMinutes(latest.mdx),
      illustration: fm.illustration,
      sources: fm.sources ?? [],
      dispatches: fm.dispatches ?? [],
      wire: fm.wire ?? [],
      ...(type === "weekly" && fm.digest ? { digest: fm.digest } : {}),
    },
  };
  return Response.json(payload, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
