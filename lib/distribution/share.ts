import type { Locale } from "../i18n/config";
import { localePath } from "../i18n/config";
import { siteUrl } from "../config";
import type { Article } from "../content";
import { brand } from "../brand";
import { lessonOfTheDay, loadAiLessons } from "../lessons";
import { readPractical, type PracticalBlock } from "../practical";
import { SHARE_FORMATS, shareImagePath, type ShareFormat } from "../share-card";

// The per-edition share pack at /data/share/<date>.cs.json, built statically
// by app/data/share/[file]/route.ts. BoardlessAI's social pack and the
// marketing calendar read this one file (issue #99, CONTRACTS.md §3). The JSON
// Schema is contracts/distribution-pack.schema.json.
//
// Version 2 keeps every version-1 field with its meaning and adds
// `social_copy`, `lesson`, `practical`, absolute card URLs in `images`,
// UTM-ready reader links in `links`, and the Markdown edition URL.

export const DISTRIBUTION_PACK_VERSION = 2;

export type SocialCopy = {
  igCaption: string;
  threadsText: string;
  storyLine: string;
  hashtags: string[];
  /** `edition`: written upstream with the edition; `derived`: built here from its title and dek. */
  origin: "edition" | "derived";
};

export type ShareImage = { url: string; width: number; height: number };

export type DistributionPack = {
  schemaVersion: typeof DISTRIBUTION_PACK_VERSION;
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
  /** Absolute URLs of the DNESKAi logotype for posts and presentation material. */
  brandLogo: { svg: string; png: string };
  /** Plain-Markdown version of the edition. */
  markdownUrl: string;
  images: Record<ShareFormat, ShareImage>;
  social_copy: SocialCopy;
  /** The term of the day on the edition's date, or null before the curriculum starts. */
  lesson: { id: string; term: string; short: string; url: string } | null;
  practical: PracticalBlock | null;
  /** Reader links carrying the UTM convention of CONTRACTS.md §4. */
  links: {
    threadsPost: string;
    threadsReply: string;
    instagramBio: string;
    instagramStory: string;
    /** Present only when the edition carries a practical item. */
    practicalStory: string | null;
  };
};

export const IG_CAPTION_MAX = 2200;
export const THREADS_TEXT_MAX = 500;
export const STORY_LINE_MAX = 90;

export function withUtm(url: string, source: string, medium: string, campaign: string): string {
  const next = new URL(url);
  next.searchParams.set("utm_source", source);
  next.searchParams.set("utm_medium", medium);
  next.searchParams.set("utm_campaign", campaign);
  return next.toString();
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:–-]+$/u, "")}…`;
}

function stringOf(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() && value.trim().length <= max ? value.trim() : null;
}

/** BoardlessAI's `social_copy` when it is complete and within bounds, else copy derived from the edition. */
export function socialCopyFor(fm: Article["frontmatter"]): SocialCopy {
  const raw = fm.social_copy;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const value = raw as Record<string, unknown>;
    const igCaption = stringOf(value.igCaption, IG_CAPTION_MAX);
    const threadsText = stringOf(value.threadsText, THREADS_TEXT_MAX);
    const storyLine = stringOf(value.storyLine, STORY_LINE_MAX * 2);
    if (igCaption && threadsText && storyLine) {
      const hashtags = Array.isArray(value.hashtags)
        ? value.hashtags.filter((tag): tag is string => typeof tag === "string" && /^[\p{L}\p{N}_]+$/u.test(tag)).slice(0, 30)
        : [];
      return { igCaption, threadsText, storyLine, hashtags, origin: "edition" };
    }
  }
  return {
    igCaption: clip(`${fm.title}\n\n${fm.dek}\n\nCelé vydání s odkazy na zdroje: odkaz v biu.`, IG_CAPTION_MAX),
    threadsText: clip(`${fm.title}\n\n${fm.dek}`, THREADS_TEXT_MAX),
    storyLine: clip(fm.title, STORY_LINE_MAX),
    hashtags: [],
    origin: "derived",
  };
}

function lessonFor(date: string, locale: Locale): DistributionPack["lesson"] {
  if (date < loadAiLessons().anchor) return null;
  const { entry } = lessonOfTheDay(date);
  return {
    id: entry.id,
    term: entry.term ?? entry.slug,
    short: locale === "cs" ? entry.cs.short : entry.en.short,
    url: `${siteUrl()}${localePath(locale, "/lekce")}#${entry.slug}`,
  };
}

export function createArticleDistributionPack(article: Article, locale: Locale): DistributionPack {
  const fm = article.frontmatter;
  const base = siteUrl();
  const articlePath = localePath(locale, `/articles/${article.slug}`);
  const canonicalUrl = `${base}${articlePath}`;
  const practical = readPractical(fm.practical, fm.date);
  const images = Object.fromEntries(
    (Object.keys(SHARE_FORMATS) as ShareFormat[]).map((format) => [
      format,
      { url: `${base}${shareImagePath(article.slug, format)}`, ...SHARE_FORMATS[format] },
    ]),
  ) as Record<ShareFormat, ShareImage>;
  return {
    schemaVersion: DISTRIBUTION_PACK_VERSION,
    issueDate: fm.date,
    language: locale,
    canonicalUrl,
    primaryHeadline: fm.title,
    alternativeHeadlines: fm.alternative_headlines ?? [],
    summary: fm.dek,
    socialPost: `${fm.title}\n\n${fm.dek}\n\n${canonicalUrl}`,
    linkedInPost: `${fm.title}\n\n${fm.dek}\n\nČtěte na ${brand.name}: ${canonicalUrl}`,
    blueskyPost: `${fm.title}. ${fm.dek} ${canonicalUrl}`.slice(0, 300),
    newsletterExcerpt: fm.dek,
    quoteCardText: fm.why_it_matters?.[0] ?? fm.dek,
    illustrationPath: fm.illustration.path ?? null,
    illustrationAlt: fm.illustration.alt,
    topics: fm.tags,
    sourceCount: fm.sources.length,
    brandLogo: {
      svg: `${base}${brand.assets.logo}`,
      png: `${base}${brand.assets.logoPng}`,
    },
    markdownUrl: `${base}/articles/${article.slug}.md`,
    images,
    social_copy: socialCopyFor(fm),
    lesson: lessonFor(fm.date, locale),
    practical,
    links: {
      threadsPost: withUtm(canonicalUrl, "threads", "post", "edition"),
      threadsReply: withUtm(canonicalUrl, "threads", "reply", "edition"),
      instagramBio: withUtm(canonicalUrl, "instagram", "bio", "edition"),
      instagramStory: withUtm(canonicalUrl, "instagram", "story", "edition"),
      practicalStory: practical ? withUtm(canonicalUrl, "instagram", "story", "practical") : null,
    },
  };
}

/** `2026-11-05.cs.json`, or `2026-11-08.weekly.cs.json` for a weekly issue. */
export function distributionPackFile(article: Article, locale: Locale): string {
  const suffix = article.frontmatter.type === "weekly" ? ".weekly" : "";
  return `${article.frontmatter.date}${suffix}.${locale}.json`;
}
