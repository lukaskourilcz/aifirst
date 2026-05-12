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
  html: string;
};

export type ArticleSummary = {
  slug: string;
  date: string;
  title: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

async function readDir(): Promise<string[]> {
  try {
    return await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }
}

function mdxToHtml(mdx: string): string {
  // Minimal renderer for scaffold; the real pipeline can wire next-mdx-remote.
  // For now treat the body as paragraphs separated by blank lines and
  // convert `## Heading` and `[text](url)` to HTML.
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = mdx.split(/\r?\n/);
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      const joined = para.join(" ");
      out.push(`<p>${linkify(escape(joined))}</p>`);
      para = [];
    }
  };
  function linkify(s: string): string {
    return s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) => `<a href="${u}">${t}</a>`);
  }
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      flush();
      out.push(`<h2>${linkify(escape(line.replace(/^##\s+/, "")))}</h2>`);
    } else if (line.trim() === "") {
      flush();
    } else {
      para.push(line);
    }
  }
  flush();
  return out.join("\n");
}

export async function listArticles(): Promise<ArticleSummary[]> {
  const files = (await readDir()).filter((f) => f.endsWith(".mdx"));
  const summaries: ArticleSummary[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const { data } = matter(raw);
    const fm = data as Partial<ArticleFrontmatter>;
    if (!fm.slug || !fm.date || !fm.title) continue;
    summaries.push({ slug: fm.slug, date: fm.date, title: fm.title });
  }
  summaries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return summaries;
}

export async function getArticle(slug: string): Promise<Article | null> {
  const files = (await readDir()).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = data as ArticleFrontmatter;
    if (fm.slug === slug) {
      return { slug, frontmatter: fm, mdx: content, html: mdxToHtml(content) };
    }
  }
  return null;
}

export async function getLatestArticle(): Promise<Article | null> {
  const [first] = await listArticles();
  return first ? getArticle(first.slug) : null;
}
