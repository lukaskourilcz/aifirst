import { describe, expect, it } from "vitest";
import type { ArticleSummary } from "../content";
import { articlesInNewsWindow, newsSitemapDocument } from "../news-sitemap";

const summary = (slug: string, date: string, fallback = false): ArticleSummary => ({
  slug,
  date,
  title: slug,
  lang: "cs",
  fallback,
});

describe("news sitemap", () => {
  it("keeps only the two publishing days ending on the newest edition", () => {
    const kept = articlesInNewsWindow([
      summary("old", "2026-09-10"),
      summary("edge", "2026-09-12"),
      summary("newest", "2026-09-13"),
      summary("fallback", "2026-09-13", true),
    ]);
    expect(kept.map((s) => s.slug)).toEqual(["newest", "edge"]);
  });

  it("is empty for an empty archive rather than inventing a window", () => {
    expect(articlesInNewsWindow([])).toEqual([]);
  });

  it("emits the news namespace, the publication name and an escaped title", () => {
    const xml = newsSitemapDocument([
      { url: "https://example.com/articles/a?x=1&y=2", title: "A & B", publishedAt: "2026-09-13", language: "cs" },
    ]);
    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    expect(xml).toContain("<news:name>DNESKAi</news:name>");
    expect(xml).toContain("<news:language>cs</news:language>");
    expect(xml).toContain("<news:publication_date>2026-09-13T06:00:00Z</news:publication_date>");
    expect(xml).toContain("<news:title>A &amp; B</news:title>");
    expect(xml).toContain("<loc>https://example.com/articles/a?x=1&amp;y=2</loc>");
  });
});
