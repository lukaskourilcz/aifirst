import { describe, expect, it } from "vitest";
import { getArticle, listArticles } from "../../content";
import { buildLlmsTxt, buildNewsSitemap, buildRss, editionMarkdown, newsWindow, rfc822 } from "../discovery";

describe("news sitemap", () => {
  it("anchors the 48-hour window on the newest edition, not a clock", () => {
    expect(newsWindow([{ frontmatter: { date: "2026-11-05" } }])).toBe("2026-11-04");
    expect(newsWindow([{ frontmatter: { date: "2026-11-01" } }])).toBe("2026-10-31");
    expect(newsWindow([])).toBeNull();
  });

  it("lists the newest Czech editions with publication, language, date and title", async () => {
    const xml = await buildNewsSitemap();
    const newest = (await listArticles("cs")).find((a) => !a.fallback && a.lang === "cs")!;
    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    expect(xml).toContain(`/articles/${newest.slug}</loc>`);
    expect(xml).toContain("<news:name>DNESKAi</news:name>");
    expect(xml).toContain("<news:language>cs</news:language>");
    expect(xml).toMatch(/<news:publication_date>\d{4}-\d{2}-\d{2}T/);
    const dates = [...xml.matchAll(/<news:publication_date>(\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]!);
    expect(dates.length).toBeGreaterThan(0);
    for (const date of dates) expect(date >= newsWindow([{ frontmatter: { date: newest.date } }])!).toBe(true);
  });
});

describe("RSS 2.0", () => {
  it("formats RFC 822 dates", () => {
    expect(rfc822("2026-11-05T06:00:00Z")).toBe("Thu, 05 Nov 2026 06:00:00 GMT");
  });

  it("carries at most 20 editions, each with a 16:9 enclosure", async () => {
    const xml = await buildRss();
    const items = xml.match(/<item>/g) ?? [];
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(20);
    expect((xml.match(/<enclosure /g) ?? []).length).toBe(items.length);
    expect(xml).toContain("/share/wide.png");
    expect(xml).toContain("<language>cs</language>");
  });
});

describe("Markdown editions and llms.txt", () => {
  it("renders an edition with its sections and sources", async () => {
    const newest = (await listArticles("cs")).find((a) => !a.fallback && a.lang === "cs")!;
    const article = (await getArticle(newest.slug, "cs"))!;
    const md = editionMarkdown(article);
    expect(md.startsWith(`# ${article.frontmatter.title}\n`)).toBe(true);
    expect(md).toContain(`/articles/${article.slug}`);
    if (article.frontmatter.why_it_matters?.length) expect(md).toContain("## Proč na tom záleží");
    if (article.frontmatter.sources.length) expect(md).toContain("## Zdroje tohoto vydání");
    expect(md).toContain(article.mdx.trim().slice(0, 80));
  });

  it("links every listed edition to its Markdown copy", async () => {
    const txt = await buildLlmsTxt();
    expect(txt.startsWith("# DNESKAi\n")).toBe(true);
    expect(txt).toContain("## Vydání");
    const links = [...txt.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]!);
    expect(links.filter((l) => l.endsWith(".md")).length).toBeGreaterThan(0);
  });
});
