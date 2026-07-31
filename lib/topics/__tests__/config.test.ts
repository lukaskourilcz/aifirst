import { describe, expect, it } from "vitest";
import { articlesForTopic, loadTopicsConfig, publishedTopics, validateTopicsConfig } from "../config";
import type { ArticleSummary } from "../../content";

const articles: ArticleSummary[] = [
  { slug: "one", date: "2026-07-21", title: "One", tags: ["gemini", "policy"] },
  { slug: "two", date: "2026-07-20", title: "Two", tags: ["anthropic"] },
];

describe("topic configuration", () => {
  it("loads the committed taxonomy", async () => {
    const config = await loadTopicsConfig();
    expect(config.topics.some((topic) => topic.slug === "ai-models")).toBe(true);
  });

  it("maps low-level tags into curated topics", async () => {
    const config = await loadTopicsConfig();
    const topic = config.topics.find((item) => item.slug === "ai-models")!;
    expect(articlesForTopic(topic, articles).map((article) => article.slug)).toEqual(["one", "two"]);
  });

  it("does not publish thin topics below the configured threshold", async () => {
    const config = await loadTopicsConfig();
    const strict = { ...config, minimumIssues: 3 };
    expect(publishedTopics(strict, articles)).toEqual([]);
  });

  it("rejects duplicate slugs", () => {
    const topic = { id: "a", slug: "same", title: { en: "A", cs: "A" }, description: { en: "A", cs: "A" }, tags: ["a"], aliases: [], featured: true, order: 1, enabled: true };
    expect(validateTopicsConfig({ schemaVersion: 1, minimumIssues: 1, topics: [topic, { ...topic, id: "b" }] })).toContain("duplicate topic slug: same");
  });

});
