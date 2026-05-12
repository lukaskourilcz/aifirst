import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

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
  dek: string;
  tags: string[];
  sources: SourceRef[];
  illustration: { path: string; prompt: string; alt: string };
  signal_strength?: number;
  dispatches?: Dispatch[];
  wire?: WireItem[];
  type?: IssueType;
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
};

export type ArticleSummary = {
  slug: string;
  date: string;
  title: string;
  dek?: string;
  tags?: string[];
  signal_strength?: number;
  type?: IssueType;
};

function defaultContentDir(): string {
  return path.join(process.cwd(), "content", "articles");
}

async function readMdxFiles(dir: string): Promise<string[]> {
  try {
    const all = await fs.readdir(dir);
    return all.filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

export async function listArticles(
  dir: string = defaultContentDir(),
): Promise<ArticleSummary[]> {
  const files = await readMdxFiles(dir);
  const summaries: ArticleSummary[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const fm = data as Partial<ArticleFrontmatter>;
    if (!fm.slug || !fm.date || !fm.title) continue;
    summaries.push({
      slug: fm.slug,
      date: fm.date,
      title: fm.title,
      dek: fm.dek,
      tags: fm.tags,
      signal_strength: fm.signal_strength,
      type: fm.type ?? "daily",
    });
  }
  summaries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return summaries;
}

export async function getArticle(
  slug: string,
  dir: string = defaultContentDir(),
): Promise<Article | null> {
  const files = await readMdxFiles(dir);
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const fm = data as ArticleFrontmatter;
    if (fm.slug === slug) {
      return { slug, frontmatter: fm, mdx: content };
    }
  }
  return null;
}

export async function getLatestArticle(
  dir: string = defaultContentDir(),
): Promise<Article | null> {
  const [first] = await listArticles(dir);
  return first ? getArticle(first.slug, dir) : null;
}

export type TagCount = { tag: string; count: number };

export async function listTagsByFrequency(
  dir: string = defaultContentDir(),
): Promise<TagCount[]> {
  const all = await listArticles(dir);
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
  dir: string = defaultContentDir(),
): Promise<ArticleSummary[]> {
  const all = await listArticles(dir);
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
  dir: string = defaultContentDir(),
): Promise<Map<string, SourceCitationStats>> {
  const files = await readMdxFiles(dir);
  const stats = new Map<string, SourceCitationStats>();
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const fm = data as Partial<ArticleFrontmatter>;
    if (!fm.date) continue;
    const seenInIssue = new Set<string>();
    for (const s of fm.sources ?? []) {
      const sourceId = (s as { id?: string }).id;
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
  dir: string = defaultContentDir(),
): Promise<ArticleSummary[]> {
  const files = await readMdxFiles(dir);
  const summaries: ArticleSummary[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const fm = data as Partial<ArticleFrontmatter>;
    if (!fm.slug || !fm.date || !fm.title) continue;
    const cited = (fm.sources ?? []).some(
      (s) => (s as { id?: string }).id === sourceId,
    );
    if (cited) {
      summaries.push({
        slug: fm.slug,
        date: fm.date,
        title: fm.title,
        dek: fm.dek,
        tags: fm.tags,
        signal_strength: fm.signal_strength,
        type: fm.type ?? "daily",
      });
    }
  }
  summaries.sort((a, b) => (a.date < b.date ? 1 : -1));
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
  dir: string = defaultContentDir(),
): Promise<SearchEntry[]> {
  const all = await listArticles(dir);
  return all.map((a) => ({
    slug: a.slug,
    date: a.date,
    title: a.title,
    dek: a.dek ?? "",
    tags: a.tags ?? [],
  }));
}
