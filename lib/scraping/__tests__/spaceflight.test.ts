import { describe, it, expect } from "vitest";
import { projectSpaceflight } from "../spaceflight.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "spaceflight",
  name: "Test Spaceflight",
  tags: ["space", "test"],
};

describe("projectSpaceflight", () => {
  it("maps results and drops entries without a url", () => {
    const data = {
      results: [
        {
          title: "Starship completes orbital test",
          url: "https://example.com/starship-orbital-test",
          summary: "A successful orbital test flight was completed today.",
          published_at: "2026-06-30T08:00:00Z",
        },
        {
          title: "Missing url item",
          summary: "Should be dropped.",
          published_at: "2026-06-29T08:00:00Z",
        },
      ],
    };

    const items = projectSpaceflight(data, SOURCE);
    expect(items).toHaveLength(1);

    const [first] = items;
    expect(first?.title).toBe("Starship completes orbital test");
    expect(first?.url).toBe("https://example.com/starship-orbital-test");
    expect(first?.summary).toBe(
      "A successful orbital test flight was completed today.",
    );
    expect(first?.publishedAt).toBe("2026-06-30T08:00:00.000Z");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["space", "test"]);
  });
});
