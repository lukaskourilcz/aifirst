import { describe, it, expect } from "vitest";
import { buildTrends } from "../trends.js";
import type { ArticleSummary } from "../content.js";

const articles: ArticleSummary[] = [
  {
    slug: "a",
    date: "2026-04-10",
    title: "A",
    tags: ["ai", "models"],
  },
  {
    slug: "b",
    date: "2026-04-22",
    title: "B",
    tags: ["ai", "policy"],
  },
  {
    slug: "c",
    date: "2026-05-04",
    title: "C",
    tags: ["dev-tools"],
  },
  {
    slug: "d",
    date: "2026-05-12",
    title: "D",
    tags: ["ai", "dev-tools", "policy"],
  },
];

describe("buildTrends", () => {
  it("returns months in chronological order", () => {
    const matrix = buildTrends(articles);
    expect(matrix.months).toEqual(["2026-04", "2026-05"]);
  });

  it("ranks tags by total frequency", () => {
    const matrix = buildTrends(articles, 3);
    expect(matrix.tags).toEqual(["ai", "dev-tools", "policy"]);
  });

  it("counts a tag once per article-month", () => {
    const matrix = buildTrends(articles);
    const aiApril = matrix.cells.find(
      (c) => c.tag === "ai" && c.month === "2026-04",
    );
    const aiMay = matrix.cells.find(
      (c) => c.tag === "ai" && c.month === "2026-05",
    );
    expect(aiApril?.count).toBe(2);
    expect(aiMay?.count).toBe(1);
  });

  it("clamps to topN", () => {
    const matrix = buildTrends(articles, 2);
    expect(matrix.tags).toHaveLength(2);
    expect(matrix.tags).toEqual(["ai", "dev-tools"]);
  });

  it("computes byMonthTotals across the kept tags only", () => {
    const matrix = buildTrends(articles, 2);
    // April: ai=2 dev-tools=0 = 2
    // May:   ai=1 dev-tools=2 = 3
    expect(matrix.byMonthTotals).toEqual([2, 3]);
  });
});
