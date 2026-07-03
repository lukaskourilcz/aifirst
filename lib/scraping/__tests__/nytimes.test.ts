import { describe, it, expect } from "vitest";
import { projectNytimes } from "../nytimes.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "nytimes",
  name: "Test NYT",
  query: "artificial intelligence",
  tags: ["tech", "test"],
};

describe("projectNytimes", () => {
  it("maps docs, drops entries without a web_url, and prefers abstract over snippet", () => {
    const data = {
      response: {
        docs: [
          {
            web_url: "https://www.nytimes.com/2026/06/30/technology/ai-piece.html",
            headline: { main: "The Quiet Rise of Ambient AI" },
            abstract: "A look at ambient AI in daily life.",
            snippet: "A shorter snippet version.",
            pub_date: "2026-06-30T12:00:00+00:00",
          },
          {
            headline: { main: "Missing url doc" },
            abstract: "Should be dropped.",
            pub_date: "2026-06-29T12:00:00+00:00",
          },
        ],
      },
    };

    const items = projectNytimes(data, SOURCE);
    expect(items).toHaveLength(1);

    const [first] = items;
    expect(first?.title).toBe("The Quiet Rise of Ambient AI");
    expect(first?.url).toBe(
      "https://www.nytimes.com/2026/06/30/technology/ai-piece.html",
    );
    expect(first?.summary).toBe("A look at ambient AI in daily life.");
    expect(first?.publishedAt).toBe("2026-06-30T12:00:00.000Z");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["tech", "test"]);
  });

  it("falls back to snippet when abstract is missing", () => {
    const data = {
      response: {
        docs: [
          {
            web_url: "https://www.nytimes.com/2026/06/28/technology/ai-snippet.html",
            headline: { main: "Snippet Fallback" },
            snippet: "A shorter snippet version.",
            pub_date: "2026-06-28T12:00:00+00:00",
          },
        ],
      },
    };

    const items = projectNytimes(data, SOURCE);
    expect(items[0]?.summary).toBe("A shorter snippet version.");
  });
});
