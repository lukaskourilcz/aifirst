import type { MetadataRoute } from "next";
import { listArticles, listTagsByFrequency } from "@/lib/content";
import { siteUrl } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [articles, tags] = await Promise.all([
    listArticles(),
    listTagsByFrequency(),
  ]);
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/archive`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/sources`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/stats`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/trends`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/glossary`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/colophon`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.4 },
    ...articles.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...tags.map((t) => ({
      url: `${base}/tags/${encodeURIComponent(t.tag)}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
