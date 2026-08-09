import fs from "node:fs/promises";
import path from "node:path";
import type { Locale } from "../i18n/config";
import { localePath } from "../i18n/config";
import { siteUrl } from "../config";
import type { Article } from "../content";

export type DistributionPack = {
  schemaVersion: 1;
  issueDate: string;
  language: Locale;
  canonicalUrl: string;
  primaryHeadline: string;
  alternativeHeadlines: string[];
  summary: string;
  socialPost: string;
  linkedInPost: string;
  blueskyPost: string;
  newsletterExcerpt: string;
  quoteCardText: string;
  illustrationPath: string | null;
  illustrationAlt: string;
  topics: string[];
  sourceCount: number;
};

export function createArticleDistributionPack(article: Article, locale: Locale): DistributionPack {
  const fm = article.frontmatter;
  const canonicalUrl = `${siteUrl()}${localePath(locale, `/articles/${article.slug}`)}`;
  return {
    schemaVersion: 1,
    issueDate: fm.date,
    language: locale,
    canonicalUrl,
    primaryHeadline: fm.title,
    alternativeHeadlines: fm.alternative_headlines ?? [],
    summary: fm.dek,
    socialPost: `${fm.title}\n\n${fm.dek}\n\n${canonicalUrl}`,
    linkedInPost: `${fm.title}\n\n${fm.dek}\n\nRead DNESKAi: ${canonicalUrl}`,
    blueskyPost: `${fm.title}. ${fm.dek} ${canonicalUrl}`.slice(0, 300),
    newsletterExcerpt: fm.dek,
    quoteCardText: fm.why_it_matters?.[0] ?? fm.dek,
    illustrationPath: fm.illustration.path ?? null,
    illustrationAlt: fm.illustration.alt,
    topics: fm.tags,
    sourceCount: fm.sources.length,
  };
}

export async function writeArticleDistributionPack(article: Article, locale: Locale): Promise<string> {
  const dir = path.join(process.cwd(), "public", "data", "share");
  await fs.mkdir(dir, { recursive: true });
  const suffix = article.frontmatter.type === "weekly" ? ".weekly" : "";
  const file = path.join(dir, `${article.frontmatter.date}${suffix}.${locale}.json`);
  await fs.writeFile(file, `${JSON.stringify(createArticleDistributionPack(article, locale), null, 2)}\n`, "utf8");
  return file;
}
