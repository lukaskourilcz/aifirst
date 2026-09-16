import { describe, expect, it } from "vitest";
import type { ArticleSummary } from "../content";
import { LLMS_RECENT_EDITIONS, llmsTxtDocument } from "../llms";

const summary = (index: number, fallback = false): ArticleSummary => ({
  slug: `2026-09-${String(index).padStart(2, "0")}-story`,
  date: `2026-09-${String(index).padStart(2, "0")}`,
  title: `Story ${index}`,
  dek: `Dek ${index}`,
  lang: "cs",
  fallback,
});

describe("llms.txt", () => {
  it("opens with the name and the summary, and links the JSON endpoints", () => {
    const text = llmsTxtDocument({
      base: "https://example.com",
      description: "Jedno vydání a máte přehled.",
      articles: [summary(13), summary(12)],
    });
    expect(text.startsWith("# DNESKAi\n\n> Jedno vydání a máte přehled.")).toBe(true);
    expect(text).toContain("- [2026-09-13 · Story 13](https://example.com/articles/2026-09-13-story): Dek 13");
    expect(text).toContain("(https://example.com/api/today.json)");
    expect(text).toContain("(https://example.com/news-sitemap.xml)");
    expect(text).toContain("## Optional");
  });

  it("lists at most the recent editions and skips fallbacks", () => {
    const fallback: ArticleSummary = { ...summary(1), slug: "2026-09-01-fallback", title: "Fallback story", fallback: true };
    const articles = [fallback, ...Array.from({ length: LLMS_RECENT_EDITIONS + 5 }, (_, i) => summary((i % 28) + 1))];
    const text = llmsTxtDocument({ base: "https://example.com", description: "d", articles });
    const listed = text.split("\n").filter((line) => line.startsWith("- [2026-")).length;
    expect(listed).toBe(LLMS_RECENT_EDITIONS);
    expect(text).not.toContain("Fallback story");
  });

  it("names the empty state instead of leaving the section blank", () => {
    expect(llmsTxtDocument({ base: "https://example.com", description: "d", articles: [] })).toContain("- Zatím žádné vydání.");
  });
});
