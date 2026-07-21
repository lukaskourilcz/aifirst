import type { MetadataRoute } from "next";
import { getArticle, listArticles } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { LOCALES, localePath } from "@/lib/i18n/config";
import { loadTopicsConfig, publishedTopics } from "@/lib/topics/config";
import { loadSources } from "@/lib/scraping/sources";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [englishArticles, czechArticles, topicsConfig, sources] = await Promise.all([
    listArticles("en"),
    listArticles("cs"),
    loadTopicsConfig(),
    loadSources(),
  ]);
  const articles = englishArticles;
  const topics = publishedTopics(topicsConfig, articles);

  const staticPaths: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/radar", changeFrequency: "daily", priority: 0.8 },
    { path: "/topics", changeFrequency: "weekly", priority: 0.8 },
    { path: "/weekly", changeFrequency: "weekly", priority: 0.8 },
    { path: "/archive", changeFrequency: "daily", priority: 0.8 },
    { path: "/sources", changeFrequency: "weekly", priority: 0.5 },
    { path: "/glossary", changeFrequency: "monthly", priority: 0.4 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/corrections", changeFrequency: "weekly", priority: 0.4 },
    { path: "/search", changeFrequency: "weekly", priority: 0.4 },
  ];

  const articleVariants = await Promise.all(
    LOCALES.flatMap((locale) => {
      const localeArticles = locale === "en" ? englishArticles : czechArticles;
      return localeArticles
        .filter((article) => !article.fallback)
        .map(async (summary) => {
          const article = await getArticle(summary.slug, locale);
          const lastCorrection = [...(article?.frontmatter.corrections ?? [])]
            .sort((a, b) => b.date.localeCompare(a.date))[0];
          return {
            url: `${base}${localePath(locale, `/articles/${summary.slug}`)}`,
            lastModified: lastCorrection?.date ?? article?.frontmatter.generation?.generated_at ?? summary.date,
            changeFrequency: "yearly" as const,
            priority: 0.6,
          };
        });
    }),
  );

  return [
    ...LOCALES.flatMap((locale) => [
    ...staticPaths.map((p) => ({
      url: `${base}${localePath(locale, p.path)}`,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...topics.map(({ topic }) => ({
      url: `${base}${localePath(locale, `/topics/${topic.slug}`)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...sources.map((source) => ({
      url: `${base}${localePath(locale, `/sources/${source.id}`)}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
    ]),
    ...articleVariants,
  ];
}
