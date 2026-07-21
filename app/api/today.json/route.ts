import { getLatestArticle } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import { brand } from "@/lib/brand";
import { loadTopicsConfig, topicsForArticle } from "@/lib/topics/config";

export const dynamic = "force-static";

export async function GET() {
  const latest = await getLatestArticle();
  if (!latest) {
    return Response.json({ status: "no-issue" }, { status: 404 });
  }
  const fm = latest.frontmatter;
  const type = fm.type ?? "daily";
  const base = siteUrl();
  const topics = topicsForArticle(await loadTopicsConfig(), {
    slug: latest.slug,
    date: fm.date,
    title: fm.title,
    tags: fm.tags,
    type,
  });
  const payload = {
    status: "ok",
    publication: brand.name,
    schema_version: 2,
    issue: {
      type,
      language: latest.lang,
      slug: latest.slug,
      date: fm.date,
      title: fm.title,
      dek: fm.dek,
      tags: fm.tags,
      topics: topics.map((topic) => topic.slug),
      url: `${base}/articles/${latest.slug}`,
      signal_strength: fm.signal_strength ?? null,
      reading_minutes: readingMinutes(latest.mdx),
      illustration: fm.illustration,
      sources: fm.sources ?? [],
      why_it_matters: fm.why_it_matters ?? [],
      what_changed: fm.what_changed ?? [],
      dispatches: fm.dispatches ?? [],
      wire: fm.wire ?? [],
      published_at: fm.generation?.generated_at ?? `${fm.date}T06:00:00Z`,
      ...(type === "weekly" && fm.digest ? { digest: fm.digest } : {}),
    },
  };
  return Response.json(payload, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
