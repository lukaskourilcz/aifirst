import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/content";

const BASE = "https://aifirst.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listArticles();
  return [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/archive`, changeFrequency: "daily", priority: 0.8 },
    ...articles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
