import { describe, it, expect } from "vitest";
import { projectGnews } from "../gnews.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "gnews",
  name: "Test GNews",
  query: "artificial intelligence",
  tags: ["tech", "test"],
};

describe("projectGnews", () => {
  it("maps articles and drops entries without a url", () => {
    const data = {
      articles: [
        {
          title: "AI breakthrough announced",
          url: "https://example.com/ai-breakthrough",
          description: "Researchers unveil a new model.",
          content: "Full article text goes here...",
          publishedAt: "2026-06-30T08:00:00Z",
        },
        {
          title: "Missing url item",
          description: "Should be dropped.",
          publishedAt: "2026-06-29T08:00:00Z",
        },
      ],
    };

    const items = projectGnews(data, SOURCE);
    expect(items).toHaveLength(1);

    const [first] = items;
    expect(first?.title).toBe("AI breakthrough announced");
    expect(first?.url).toBe("https://example.com/ai-breakthrough");
    expect(first?.summary).toBe("Researchers unveil a new model.");
    expect(first?.publishedAt).toBe("2026-06-30T08:00:00.000Z");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["tech", "test"]);
  });
});
