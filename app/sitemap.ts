import type { MetadataRoute } from "next";
import { listArticles, listTagsByFrequency } from "@/lib/content";

const BASE = "https://aifirst.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, tags] = await Promise.all([
    listArticles(),
    listTagsByFrequency(),
  ]);
  return [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/archive`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/sources`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/stats`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.4 },
    ...articles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...tags.map((t) => ({
      url: `${BASE}/tags/${encodeURIComponent(t.tag)}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
