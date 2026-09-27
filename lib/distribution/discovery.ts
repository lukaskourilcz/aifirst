// Machine-facing views of the editions, all built statically (issue #99):
// the Google News sitemap, an RSS 2.0 feed beside the Atom one, /llms.txt and
// a plain-Markdown copy of each edition. Nothing here reads a clock: every
// window is anchored on the newest edition's date, so the same content always
// builds the same files.

import type { Article, ArticleSummary } from "../content";
import { getArticle, listArticles } from "../content";
import { siteUrl } from "../config";
import { brand } from "../brand";
import { escapeXml } from "../feed";
import { DEFAULT_LOCALE } from "../i18n/config";
import { dict } from "../i18n/dictionaries";
import { provenanceSentence, topicLabels } from "../labels";
import { readPractical, practicalTypeLabel } from "../practical";
import { czechLongDate, czechWeekdayDate } from "../weeks";
import { shareImagePath, SHARE_FORMATS } from "../share-card";

/** Daily editions publish at 06:00 UTC unless the edition records its own time. */
export function publishedAt(article: Article): string {
  return article.frontmatter.generation?.generated_at ?? `${article.frontmatter.date}T06:00:00Z`;
}

function addDays(dateKey: string, delta: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** Real Czech editions, newest first; legacy English files are not news. */
async function czechEditions(limit?: number): Promise<Article[]> {
  const summaries: ArticleSummary[] = (await listArticles(DEFAULT_LOCALE)).filter((s) => !s.fallback && s.lang === "cs");
  const articles: Article[] = [];
  for (const summary of limit === undefined ? summaries : summaries.slice(0, limit)) {
    const article = await getArticle(summary.slug, DEFAULT_LOCALE);
    if (article && !article.fallback) articles.push(article);
  }
  return articles;
}

// ------------------------------------------------------------------ news

/**
 * Google News wants articles from the last 48 hours. The window is the newest
 * edition's day and the day before, not the build's clock; Google ignores
 * anything older on its own, and a quiet stretch keeps the last two days
 * listed instead of an empty urlset.
 */
export function newsWindow(editions: Array<{ frontmatter: { date: string } }>): string | null {
  const newest = editions[0]?.frontmatter.date;
  return newest ? addDays(newest, -1) : null;
}

export async function buildNewsSitemap(): Promise<string> {
  const base = siteUrl();
  const editions = await czechEditions(10);
  const from = newsWindow(editions);
  const recent = from ? editions.filter((a) => a.frontmatter.date >= from) : [];
  const urls = recent.map((article) => `  <url>
    <loc>${escapeXml(`${base}/articles/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(brand.name)}</news:name>
        <news:language>cs</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(publishedAt(article))}</news:publication_date>
      <news:title>${escapeXml(article.frontmatter.title)}</news:title>
    </news:news>
  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>
`;
}

// ------------------------------------------------------------------ RSS 2.0

const RFC822_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RFC822_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function rfc822(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${RFC822_DAYS[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${RFC822_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} GMT`;
}

/** RSS 2.0 for readers and aggregators that do not take Atom; the 20 newest editions with a 16:9 card. */
export async function buildRss(): Promise<string> {
  const base = siteUrl();
  const editions = await czechEditions(20);
  const wide = SHARE_FORMATS.wide;
  const items = editions.map((article) => {
    const fm = article.frontmatter;
    const url = `${base}/articles/${article.slug}`;
    const categories = topicLabels(fm.tags).map((label) => `\n      <category>${escapeXml(label)}</category>`).join("");
    return `    <item>
      <title>${escapeXml(fm.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(publishedAt(article))}</pubDate>
      <description>${escapeXml(fm.dek)}</description>${categories}
      <enclosure url="${escapeXml(`${base}${shareImagePath(article.slug, "wide")}`)}" type="image/png" length="0"/>
      <media:content url="${escapeXml(`${base}${shareImagePath(article.slug, "wide")}`)}" medium="image" type="image/png" width="${wide.width}" height="${wide.height}"/>
    </item>`;
  });
  const newest = editions[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(dict(DEFAULT_LOCALE).meta.siteTitle)}</title>
    <link>${escapeXml(`${base}/`)}</link>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(brand.description)}</description>
    <language>cs</language>
    <image>
      <url>${escapeXml(`${base}/favicon-32.png`)}</url>
      <title>${escapeXml(brand.name)}</title>
      <link>${escapeXml(`${base}/`)}</link>
    </image>${newest ? `\n    <lastBuildDate>${rfc822(publishedAt(newest))}</lastBuildDate>` : ""}
${items.join("\n")}
  </channel>
</rss>
`;
}

// ------------------------------------------------------------------ Markdown

function bullets(items: string[] | undefined): string {
  return (items ?? []).map((item) => `- ${item}`).join("\n");
}

/** The edition as plain Markdown: the same text, sections and sources as the page. */
export function editionMarkdown(article: Article): string {
  const fm = article.frontmatter;
  const t = dict(DEFAULT_LOCALE);
  const base = siteUrl();
  const url = `${base}/articles/${article.slug}`;
  const provenance = provenanceSentence(fm.generation, (fm.sources ?? []).length, t.article);
  const practical = readPractical(fm.practical, fm.date);
  const parts: string[] = [
    `# ${fm.title}`,
    `> ${fm.dek.replace(/\n+/g, " ")}`,
    [
      `${brand.name} · ${czechWeekdayDate(fm.date)} · ${url}`,
      provenance ? `${provenance} (${base}/about#redakce)` : null,
    ].filter(Boolean).join("\n"),
  ];
  if (fm.why_it_matters?.length) parts.push(`## ${t.article.whyItMatters}\n\n${bullets(fm.why_it_matters)}`);
  if (fm.what_changed?.length) parts.push(`## ${t.article.whatChanged}\n\n${bullets(fm.what_changed)}`);
  if (fm.uncertainty?.length) parts.push(`## ${t.article.uncertainty}\n\n${bullets(fm.uncertainty)}`);
  parts.push(article.mdx.trim());
  if (fm.dispatches?.length) {
    parts.push(`## ${t.sections.briefs}\n\n${fm.dispatches.map((item) =>
      `- **${item.title}** ${item.body.replace(/\n+/g, " ")}${item.source_url ? ` (${item.source_url})` : ""}`).join("\n")}`);
  }
  if (fm.wire?.length) {
    parts.push(`## ${t.sections.watchlist}\n\n${fm.wire.map((item) => `- [${item.title}](${item.url}) · ${item.source}`).join("\n")}`);
  }
  if (practical) {
    parts.push(`## ${t.daily.practicalKicker}\n\n${practical.items.map((item) => [
      `**${practicalTypeLabel(item.type)}: ${item.title}**`,
      "",
      item.type === "prompt" ? `\`\`\`\n${item.text}\n\`\`\`` : item.text,
      item.url ? `\n${item.url}${item.verified_at ? ` (${t.daily.practicalVerified} ${czechLongDate(item.verified_at)})` : ""}` : "",
    ].join("\n")).join("\n\n")}`);
  }
  if (fm.corrections?.length) {
    parts.push(`## ${t.article.corrections}\n\n${fm.corrections.map((c) => `- ${czechLongDate(c.date)}: ${c.description}`).join("\n")}`);
  }
  if (fm.sources?.length) {
    parts.push(`## ${t.article.sourceLedger}\n\n${fm.sources.map((source, index) =>
      `${index + 1}. [${source.title}](${source.url})${source.publisher ? ` · ${source.publisher}` : ""}`).join("\n")}`);
  }
  return `${parts.join("\n\n")}\n`;
}

// ------------------------------------------------------------------ llms.txt

/** https://llmstxt.org: what the site is, then links to the Markdown editions. */
export async function buildLlmsTxt(): Promise<string> {
  const base = siteUrl();
  const editions = await czechEditions(30);
  const t = dict(DEFAULT_LOCALE);
  const lines = [
    `# ${brand.name}`,
    "",
    `> ${brand.shortDescription} ${brand.description}`,
    "",
    "DNESKAi is a Czech daily briefing about the AI and technology stories that mattered. Each edition is written in Czech by a language model from the sources it lists; the About page says who is responsible and whether a person reviewed it. Every edition below has a plain-Markdown copy at its URL plus `.md`.",
    "",
    "## Vydání",
    "",
    ...editions.map((article) => `- [${article.frontmatter.title}](${base}/articles/${article.slug}.md): ${czechLongDate(article.frontmatter.date)}. ${article.frontmatter.dek.replace(/\n+/g, " ")}`),
    "",
    `## ${t.footer.trust}`,
    "",
    `- [${t.rail.aboutMagazine}](${base}/about): who writes the editions, method, sources, corrections policy`,
    `- [${t.rail.sources}](${base}/sources): the citation registry`,
    `- [${t.rail.corrections}](${base}/corrections): every published correction`,
    `- [${t.rail.glossary}](${base}/lekce): the AI glossary`,
    "",
    "## Optional",
    "",
    `- [${t.rail.archive}](${base}/archive): every edition by month`,
    `- [Atom](${base}/feed.xml) · [RSS](${base}/rss.xml) · [Sitemap](${base}/sitemap.xml)`,
    `- [Today JSON](${base}/api/today.json)`,
  ];
  return `${lines.join("\n")}\n`;
}
