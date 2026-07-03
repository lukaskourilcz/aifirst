import type { MetadataRoute } from "next";
import { listArticles, listTagsByFrequency } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { LOCALES, localePath } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [articles, tags] = await Promise.all([
    listArticles(),
    listTagsByFrequency(),
  ]);

  const staticPaths: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/archive", changeFrequency: "daily", priority: 0.8 },
    { path: "/tags", changeFrequency: "weekly", priority: 0.5 },
    { path: "/sources", changeFrequency: "weekly", priority: 0.5 },
    { path: "/stats", changeFrequency: "weekly", priority: 0.5 },
    { path: "/trends", changeFrequency: "weekly", priority: 0.5 },
    { path: "/pulse", changeFrequency: "daily", priority: 0.5 },
    { path: "/glossary", changeFrequency: "monthly", priority: 0.4 },
    { path: "/colophon", changeFrequency: "monthly", priority: 0.3 },
    { path: "/search", changeFrequency: "weekly", priority: 0.4 },
  ];

  // Emit every page in both locales (Czech unprefixed, English under /en).
  return LOCALES.flatMap((locale) => [
    ...staticPaths.map((p) => ({
      url: `${base}${localePath(locale, p.path)}`,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...articles.map((a) => ({
      url: `${base}${localePath(locale, `/articles/${a.slug}`)}`,
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...tags.map((t) => ({
      url: `${base}${localePath(locale, `/tags/${encodeURIComponent(t.tag)}`)}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ]);
}
