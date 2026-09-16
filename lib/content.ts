import { editorialHold } from "./editorial-holds";
import fs from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { byDateDesc } from "./helpers/date";
import { groupBy } from "./helpers/group";
import { CONTENT_LANGS, DEFAULT_LOCALE, isContentLang, isLocale, type ContentLang, type Locale } from "./i18n/config";
import { ogImageFor } from "./og";

export type Dispatch = {
  title: string;
  body: string;
  source_url?: string;
  topic?: string;
};

export type WireItem = {
  title: string;
  url: string;
  source: string;
};

/**
 * The practical block: the one thing a reader can go and try today. Delivered
 * upstream as an optional article-frontmatter key, never as a package field.
 *
 * `variant` is decided upstream by the edition's own date and is the only thing
 * that chooses the heading. The reader must not re-derive the weekday: a
 * `daily` block on a Friday is the honest fallback when only one usable thing
 * was found, and this side has no clock to argue with it.
 */
export const PRACTICAL_KINDS = ["prompt", "tool", "howto"] as const;
export type PracticalKind = (typeof PRACTICAL_KINDS)[number];

export const PRACTICAL_VARIANTS = ["daily", "friday-tools"] as const;
export type PracticalVariant = (typeof PRACTICAL_VARIANTS)[number];

/** Every key is required upstream; nothing here is optional by design. */
export type PracticalItem = {
  kind: PracticalKind;
  title: string;
  body: string;
  source_url: string;
};

export type PracticalBlock = {
  variant: PracticalVariant;
  items: PracticalItem[];
};

export type SourceRef = {
  id: string;
  url: string;
  title: string;
  source_id?: string;
  publisher?: string;
  source_type?: string;
  classification?: "primary" | "secondary";
  published_at?: string;
  supports?: string[];
};

export type Correction = {
  date: string;
  description: string;
  section?: string;
};

export type GenerationProvenance = {
  generated_at: string;
  human_reviewed: boolean;
  models: {
    curation?: string;
    writing?: string;
    utility?: string;
  };
  source_candidates?: number;
  cited_sources?: number;
  image_provider?: string;
  cost?: { amount: number; currency: string };
  package_hash?: string;
};

export type Sponsor = {
  name: string;
  url: string;
  label: string;
  copy: string;
  image?: string;
  image_alt?: string;
};

export type IssueType = "daily" | "weekly";

/** The section keys an edition can be filed under. English by contract. */
export const ARTICLE_CATEGORIES = ["ai-models"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export function isArticleCategory(value: unknown): value is ArticleCategory {
  return typeof value === "string" && (ARTICLE_CATEGORIES as readonly string[]).includes(value);
}

export type ArticleFrontmatter = {
  title: string;
  slug: string;
  date: string;
  lang?: ContentLang;
  dek: string;
  alternative_headlines?: string[];
  tags: string[];
  /**
   * Machine keys assigned upstream, separate from `tags`, which stay Czech.
   * Absent is the normal state: an uncategorised edition is correct more often
   * than a miscategorised one.
   */
  categories?: ArticleCategory[];
  sources: SourceRef[];
  illustration: {
    path?: string;
    thumbnail_path?: string;
    /**
     * Legacy only. Upstream stopped emitting it: nothing has ever generated an image from it,
     * and it was the text that ended up captioning real photographs with imagined illustrations.
     * Existing MDX still carries it, so the field stays readable and stays optional.
     */
    prompt?: string;
    alt: string;
    width?: number;
    height?: number;
    origin?: "photo" | "svg";
    attribution?: {
      license: string;
      author: string;
      source_url: string;
      text: string;
    };
  };
  signal_strength?: number;
  schema_version?: number;
  why_it_matters?: string[];
  what_changed?: string[];
  uncertainty?: string[];
  corrections?: Correction[];
  generation?: GenerationProvenance;
  translation_of?: string;
  sponsor?: Sponsor;
  dispatches?: Dispatch[];
  wire?: WireItem[];
  /**
   * Absent on every edition published so far: upstream ships it only once its
   * own quality gate turns the item on. Render-nothing is therefore the state
   * that has to be right.
   */
  practical?: PracticalBlock;
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
  // Language actually returned, and whether it fell back from the requested locale — a legacy
  // English-only issue served on a Czech-only site. This is the file's language, not a locale
  // the site publishes.
  lang: ContentLang;
  fallback: boolean;
  modifiedAt?: string;
};

export type ArticleSummary = {
  slug: string;
  date: string;
  title: string;
  dek?: string;
  tags?: string[];
  categories?: ArticleCategory[];
  signal_strength?: number;
  type?: IssueType;
  lang?: ContentLang;
  fallback?: boolean;
  // Resolved cover thumbnail — real illustration or a cached og:image from
  // the article's sources. Absent when the article has no real picture, so
  // the UI can render text-only cards instead of an empty tile.
  heroPhoto?: string;
};

export type CorrectionRecord = Correction & {
  article: ArticleSummary;
};

function defaultContentDir(): string {
  return path.join(process.cwd(), "content", "articles");
}

// Retained legacy placeholder illustrations are ~3 KB flat panels. New
// BoardlessAI deliveries either include a real dated hero or no hero at all.
const REAL_ILLUSTRATION_MIN_BYTES = 8_192;
const illustrationRealCache = new Map<string, boolean>();

// Returns true when the illustration path points to a real image file rather
// than one of the retained pre-cutover flat placeholders.
export function hasRealIllustration(illustrationPath?: string): boolean {
  if (!illustrationPath) return false;
  if (illustrationPath.endsWith("/placeholder.webp")) return false;
  const cached = illustrationRealCache.get(illustrationPath);
  if (cached !== undefined) return cached;
  const abs = path.join(process.cwd(), "public", illustrationPath.replace(/^\//, ""));
  let real = false;
  if (existsSync(abs)) {
    try {
      real = illustrationPath.startsWith("/images/editions/") || statSync(abs).size >= REAL_ILLUSTRATION_MIN_BYTES;
    } catch {
      real = false;
    }
  }
  illustrationRealCache.set(illustrationPath, real);
  return real;
}

// A delivered .svg cover is a drawn plate: it arrives already composed, and on
// the oldest generator it has the headline burned into the artwork. Live text is
// never laid over one, so every overlay treatment checks this first.
export function isDrawnPlate(heroPath: string | null | undefined): boolean {
  return typeof heroPath === "string" && heroPath.toLowerCase().endsWith(".svg");
}

// Best available cover for frontmatter: prefer a real delivered illustration,
// otherwise a cached og:image from one of the article's own
// sources or wire items. Returns null when nothing usable is available.
export function resolveHeroPhoto(fm: Partial<ArticleFrontmatter>): string | null {
  const own = fm.illustration?.path;
  if (hasRealIllustration(own)) return own ?? null;
  for (const s of fm.sources ?? []) {
    const img = ogImageFor(s.url);
    if (img) return img;
  }
  for (const w of fm.wire ?? []) {
    const img = ogImageFor(w.url);
    if (img) return img;
  }
  return null;
}

/**
 * The most items a practical block may render. Upstream sends one on a daily
 * block and four on a Friday one; a fifth would be a contract change, and the
 * reader drops it rather than growing the section to fit.
 */
const PRACTICAL_MAX_ITEMS = 4;

/**
 * Normalise the optional practical block into something a Server Component can
 * render, or null.
 *
 * `getArticle` casts gray-matter's output straight to `ArticleFrontmatter`, so
 * nothing has checked this field by the time a page reads it. Every rule below
 * is therefore load-bearing: a malformed item is dropped, a block that loses
 * every item becomes null, and an unrecognised variant falls back to `daily`
 * rather than rendering a section with no heading.
 */
export function resolvePractical(fm: Partial<ArticleFrontmatter>): PracticalBlock | null {
  const raw: unknown = fm.practical;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const block = raw as { variant?: unknown; items?: unknown };
  if (!Array.isArray(block.items) || block.items.length === 0) return null;

  const items: PracticalItem[] = [];
  for (const candidate of block.items) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const item = candidate as Record<string, unknown>;
    const { kind, title, body } = item;
    const sourceUrl = item.source_url;
    if (typeof kind !== "string" || !(PRACTICAL_KINDS as readonly string[]).includes(kind)) continue;
    if (typeof title !== "string" || title.trim() === "") continue;
    if (typeof body !== "string" || body.trim() === "") continue;
    // https only. A prompt or a tool the reader is being told to go and use is
    // the last place to serve a downgraded link.
    if (typeof sourceUrl !== "string" || !sourceUrl.startsWith("https://")) continue;
    items.push({ kind: kind as PracticalKind, title, body, source_url: sourceUrl });
  }
  if (items.length === 0) return null;

  const variant =
    typeof block.variant === "string" && (PRACTICAL_VARIANTS as readonly string[]).includes(block.variant)
      ? (block.variant as PracticalVariant)
      : "daily";
  return { variant, items: items.slice(0, PRACTICAL_MAX_ITEMS) };
}

function resolveThumbnailPhoto(fm: Partial<ArticleFrontmatter>): string | null {
  const thumbnail = fm.illustration?.thumbnail_path;
  if (hasRealIllustration(thumbnail)) return thumbnail ?? null;
  return resolveHeroPhoto(fm);
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
  lang: ContentLang;
};

// The content language of a file: explicit `lang` frontmatter wins, then
// a `.cs.mdx` / `.en.mdx` filename suffix, else legacy files are English.
function entryLang(file: string, fm: Partial<ArticleFrontmatter>): ContentLang {
  if (fm.lang && isContentLang(fm.lang)) return fm.lang;
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
  lang: ContentLang;
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
  // Four May articles exist only in English. Serving one at its own URL under an honest
  // notice beats deleting it or 404ing a page that has been live for months.
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
  lang: ContentLang,
  fallback: boolean,
): ArticleSummary | null {
  if (!fm.slug || !fm.date || !fm.title || editorialHold(fm.slug)) return null;
  const heroPhoto = resolveThumbnailPhoto(fm) ?? undefined;
  return {
    slug: fm.slug,
    date: fm.date,
    title: fm.title,
    dek: fm.dek,
    tags: fm.tags,
    // Unknown values are dropped rather than failing the read: a category the
    // reader does not know about yet must not take a published edition down.
    categories: fm.categories?.filter(isArticleCategory),
    signal_strength: fm.signal_strength,
    type: fm.type ?? "daily",
    lang,
    fallback,
    heroPhoto,
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
  const fileStat = await fs.stat(path.join(dir, picked.entry.file)).catch(() => null);
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as ArticleFrontmatter,
    mdx: content,
    lang: picked.entry.lang,
    fallback: picked.fallback,
    modifiedAt: fileStat?.mtime.toISOString(),
  };
}

/** Locales backed by a real committed file for an issue (never fallbacks). */
export async function getArticleLocales(
  slug: string,
  dir: string = defaultContentDir(),
): Promise<ContentLang[]> {
  const locales = new Set(
    (await readEntries(dir))
      .filter((entry) => entry.fm.slug === slug)
      .map((entry) => entry.lang),
  );
  return CONTENT_LANGS.filter((lang) => locales.has(lang));
}

export async function listCorrections(
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<CorrectionRecord[]> {
  const summaries = await listArticles(locale, dir);
  const records: CorrectionRecord[] = [];
  for (const summary of summaries) {
    const article = await getArticle(summary.slug, locale, dir);
    for (const correction of article?.frontmatter.corrections ?? []) {
      records.push({ ...correction, article: summary });
    }
  }
  return records.sort((a, b) =>
    a.date === b.date
      ? b.article.date.localeCompare(a.article.date)
      : b.date.localeCompare(a.date),
  );
}

export function adjacentIssues(
  currentSlug: string,
  all: ArticleSummary[],
): { previous: ArticleSummary | null; next: ArticleSummary | null } {
  const index = all.findIndex((article) => article.slug === currentSlug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: all[index + 1] ?? null,
    next: all[index - 1] ?? null,
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

// Citations per month over the last `months` months, for each source. The
// caller passes this to the source card sparkline. Returns a bucket of
// integers ordered oldest → newest so the sparkline reads left-to-right.
export async function sourceCitationsByMonth(
  months = 6,
  locale: Locale = DEFAULT_LOCALE,
  dir: string = defaultContentDir(),
): Promise<Map<string, number[]>> {
  const resolved = resolveByLocale(await readEntries(dir), locale);
  const today = new Date();
  const buckets: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    buckets.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  const bucketIndex = new Map(buckets.map((b, i) => [b, i]));
  const out = new Map<string, number[]>();
  for (const { fm } of resolved) {
    if (!fm.date) continue;
    const month = fm.date.slice(0, 7);
    const idx = bucketIndex.get(month);
    if (idx === undefined) continue;
    const seenInIssue = new Set<string>();
    for (const s of fm.sources ?? []) {
      const sourceId = s.id;
      if (!sourceId || seenInIssue.has(sourceId)) continue;
      seenInIssue.add(sourceId);
      let arr = out.get(sourceId);
      if (!arr) {
        arr = new Array(months).fill(0);
        out.set(sourceId, arr);
      }
      arr[idx] = (arr[idx] ?? 0) + 1;
    }
  }
  return out;
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
