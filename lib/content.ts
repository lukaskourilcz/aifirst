import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type ArticleFrontmatter = {
  title: string;
  slug: string;
  date: string;
  dek: string;
  tags: string[];
  sources: Array<{ id: string; url: string; title: string }>;
  illustration: { path: string; prompt: string; alt: string };
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
    summaries.push({ slug: fm.slug, date: fm.date, title: fm.title });
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
