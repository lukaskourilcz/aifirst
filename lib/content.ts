import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { byDateDesc } from "./helpers/date";
import { groupBy } from "./helpers/group";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n/config";

export type Dispatch = {
  title: string;
  body: string;
  source_url?: string;
};

export type WireItem = {
  title: string;
  url: string;
  source: string;
};

export type SourceRef = { id: string; url: string; title: string };

export type IssueType = "daily" | "weekly";

export type ArticleFrontmatter = {
  title: string;
  slug: string;
  date: string;
  lang?: Locale;
  dek: string;
  tags: string[];
  sources: SourceRef[];
  illustration: { path: string; prompt: string; alt: string };
  signal_strength?: number;
  dispatches?: Dispatch[];
  wire?: WireItem[];
  type?: IssueType;
  editors_note?: string;
  glossary_terms?: string[];
  digest?: {
    from: string;
    to: string;
    covered_slugs: string[];
  };
};

export type Article = {
  slug: string;
  frontmatter: ArticleFrontmatter;
  mdx: string;
  // Language actually returned, and whether it fell back from the
  // requested locale (e.g. a legacy English-only issue viewed in Czech).
  lang: Locale;
  fallback: boolean;
};

export type ArticleSummary = {
  slug: string;
  date: string;
  title: string;
  dek?: string;
  tags?: string[];
  signal_strength?: number;
  type?: IssueType;
  lang?: Locale;
  fallback?: boolean;
};

function defaultContentDir(): string {
  return path.join(process.cwd(), "content", "articles");
}

export async function readMdxFiles(dir: string): Promise<string[]> {
  try {
    const all = await fs.readdir(dir);
    return all.filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

type RawEntry = {
  file: string;
  fm: Partial<ArticleFrontmatter>;
  lang: Locale;
};

// The content language of a file: explicit `lang` frontmatter wins, then
// a `.cs.mdx` / `.en.mdx` filename suffix, else legacy files are English.
function entryLang(file: string, fm: Partial<ArticleFrontmatter>): Locale {
  if (fm.lang && isLocale(fm.lang)) return fm.lang;
  if (file.endsWith(".cs.mdx")) return "cs";
  if (file.endsWith(".en.mdx")) return "en";
  return "en";
}

async function readEntries(dir: string): Promise<RawEntry[]> {
  const files = await readMdxFiles(dir);
  const out: RawEntry[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const fm = data as Partial<ArticleFrontmatter>;
    out.push({ file, fm, lang: entryLang(file, fm) });
  }
  return out;
}

type ResolvedEntry = {
  fm: Partial<ArticleFrontmatter>;
  lang: Locale;
  fallback: boolean;
};

// Pick the right file for each issue (one per slug) for a locale, falling
// back to the English version when the requested language is missing.
function pickForLocale(
  candidates: RawEntry[],
  locale: Locale,
): { entry: RawEntry; fallback: boolean } | null {
  const wanted = candidates.find((e) => e.lang === locale);
  if (wanted) return { entry: wanted, fallback: false };
  const english = candidates.find((e) => e.lang === "en");
  if (english) return { entry: english, fallback: true };
  const first = candidates[0];
  return first ? { entry: first, fallback: first.lang !== locale } : null;
}

function resolveByLocale(
  entries: RawEntry[],
  locale: Locale,
): ResolvedEntry[] {
  // One bucket of language variants per slug.
  const bySlug = groupBy(
    entries.filter((e) => e.fm.slug),
    (e) => e.fm.slug as string,
  );
  const out: ResolvedEntry[] = [];
  for (const candidates of bySlug.values()) {
    const picked = pickForLocale(candidates, locale);
    if (picked) {
      out.push({ fm: picked.entry.fm, lang: picked.entry.lang, fallback: picked.fallback });
    }
  }
  return out;
}

function toSummary(
  fm: Partial<ArticleFrontmatter>,
  lang: Locale,
  fallback: boolean,
): ArticleSummary | null {
  if (!fm.slug || !fm.date || !fm.title) return null;
  return {
    slug: fm.slug,
    date: fm.date,
    title: fm.title,
    dek: fm.dek,
    tags: fm.tags,
    signal_strength: fm.signal_strength,
    type: fm.type ?? "daily",
    lang,
    fallback,
  };
}

export async function listArticles(
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<ArticleSummary[]> {
  const resolved = resolveByLocale(await readEntries(dir), locale);
  const summaries = resolved
    .map((r) => toSummary(r.fm, r.lang, r.fallback))
    .filter((s): s is ArticleSummary => s !== null);
  summaries.sort(byDateDesc);
  return summaries;
}

export async function getArticle(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<Article | null> {
  const candidates = (await readEntries(dir)).filter((e) => e.fm.slug === slug);
  const picked = pickForLocale(candidates, locale);
  if (!picked) return null;
  const raw = await fs.readFile(path.join(dir, picked.entry.file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as ArticleFrontmatter,
    mdx: content,
    lang: picked.entry.lang,
    fallback: picked.fallback,
  };
}

export async function getLatestArticle(
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<Article | null> {
  const [first] = await listArticles(locale, dir);
  return first ? getArticle(first.slug, locale, dir) : null;
}

export type TagCount = { tag: string; count: number };

export async function listTagsByFrequency(
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<TagCount[]> {
  const all = await listArticles(locale, dir);
  const counts = new Map<string, number>();
  for (const a of all) {
    for (const t of a.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function listArticlesByTag(
  tag: string,
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<ArticleSummary[]> {
  const all = await listArticles(locale, dir);
  return all.filter((a) => (a.tags ?? []).includes(tag));
}

export function relatedArticles(
  current: ArticleSummary,
  all: ArticleSummary[],
  limit = 3,
): ArticleSummary[] {
  const currentTags = new Set(current.tags ?? []);
  if (currentTags.size === 0) return [];
  return all
    .filter((a) => a.slug !== current.slug)
    .map((a) => {
      const overlap = (a.tags ?? []).filter((t) => currentTags.has(t)).length;
      return { a, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((x, y) => y.overlap - x.overlap || (x.a.date < y.a.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.a);
}

export type SourceCitationStats = {
  id: string;
  count: number;
  latestDate: string | null;
};

export async function sourceCitationStats(
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<Map<string, SourceCitationStats>> {
  const resolved = resolveByLocale(await readEntries(dir), locale);
  const stats = new Map<string, SourceCitationStats>();
  for (const { fm } of resolved) {
    if (!fm.date) continue;
    const seenInIssue = new Set<string>();
    for (const s of fm.sources ?? []) {
      const sourceId = s.id;
      if (!sourceId || seenInIssue.has(sourceId)) continue;
      seenInIssue.add(sourceId);
      const existing = stats.get(sourceId) ?? {
        id: sourceId,
        count: 0,
        latestDate: null,
      };
      existing.count += 1;
      if (!existing.latestDate || existing.latestDate < fm.date) {
        existing.latestDate = fm.date;
      }
      stats.set(sourceId, existing);
    }
  }
  return stats;
}

export async function listArticlesBySource(
  sourceId: string,
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<ArticleSummary[]> {
  const resolved = resolveByLocale(await readEntries(dir), locale);
  const summaries: ArticleSummary[] = [];
  for (const { fm, lang, fallback } of resolved) {
    const summary = toSummary(fm, lang, fallback);
    if (!summary) continue;
    if ((fm.sources ?? []).some((s) => s.id === sourceId)) {
      summaries.push(summary);
    }
  }
  summaries.sort(byDateDesc);
  return summaries;
}

export type SearchEntry = {
  slug: string;
  date: string;
  title: string;
  dek: string;
  tags: string[];
};

export async function buildSearchIndex(
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<SearchEntry[]> {
  const all = await listArticles(locale, dir);
  return all.map((a) => ({
    slug: a.slug,
    date: a.date,
    title: a.title,
    dek: a.dek ?? "",
    tags: a.tags ?? [],
  }));
}
