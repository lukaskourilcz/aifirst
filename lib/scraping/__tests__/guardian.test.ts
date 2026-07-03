import { describe, it, expect } from "vitest";
import { projectGuardian } from "../guardian.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "guardian",
  name: "Test Guardian",
  query: "artificial intelligence",
  tags: ["tech", "test"],
};

describe("projectGuardian", () => {
  it("maps results and drops entries without a webUrl", () => {
    const data = {
      response: {
        results: [
          {
            webTitle: "AI reshapes the newsroom",
            webUrl: "https://www.theguardian.com/technology/ai-reshapes",
            webPublicationDate: "2026-06-30T08:00:00Z",
            fields: { trailText: "How AI is changing journalism." },
          },
          {
            webTitle: "Missing url item",
            webPublicationDate: "2026-06-29T08:00:00Z",
            fields: { trailText: "Should be dropped." },
          },
        ],
      },
    };

    const items = projectGuardian(data, SOURCE);
    expect(items).toHaveLength(1);

    const [first] = items;
    expect(first?.title).toBe("AI reshapes the newsroom");
    expect(first?.url).toBe("https://www.theguardian.com/technology/ai-reshapes");
    expect(first?.summary).toBe("How AI is changing journalism.");
    expect(first?.publishedAt).toBe("2026-06-30T08:00:00.000Z");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["tech", "test"]);
  });
});
