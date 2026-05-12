import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { parseRssFeed, projectRssItem } from "../rss.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "rss",
  name: "Test feed",
  url: "https://example.com",
  tags: ["tech", "test"],
};

describe("parseRssFeed", () => {
  it("parses items, skips those without a link, and tags them", async () => {
    const xml = await fs.readFile(
      path.join(__dirname, "fixtures", "sample-rss.xml"),
      "utf8",
    );
    const items = await parseRssFeed(xml, SOURCE);
    expect(items).toHaveLength(2);

    const [first, second] = items;
    expect(first?.title).toBe("First post");
    expect(first?.url).toBe("https://example.com/posts/first");
    expect(first?.summary).toBe("Hello world, this is the first post.");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["tech", "test"]);
    expect(first?.id).toMatch(/^[0-9a-f]{16}$/);

    expect(second?.title).toBe("Second post with a long body");
    expect(new Date(second?.publishedAt ?? "").toISOString()).toBe(
      "2026-05-12T09:30:00.000Z",
    );
  });
});

describe("projectRssItem", () => {
  it("returns null when the item has no link", () => {
    expect(projectRssItem({ title: "x" }, SOURCE)).toBeNull();
  });

  it("falls back through content/summary fields", () => {
    const out = projectRssItem(
      { link: "https://example.com/a", title: "t", content: "<p>fallback</p>" },
      SOURCE,
    );
    expect(out?.summary).toBe("fallback");
  });
});
