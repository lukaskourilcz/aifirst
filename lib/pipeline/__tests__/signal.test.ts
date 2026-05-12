import { describe, it, expect } from "vitest";
import { computeSignalStrength } from "../signal.js";
import type { Source } from "../../scraping/types.js";

const registry: Source[] = [
  { id: "anthropic-news", type: "rss", name: "Anthropic", weight: 0.85 },
  { id: "openai-blog", type: "rss", name: "OpenAI", weight: 0.85 },
  { id: "deepmind-blog", type: "rss", name: "DeepMind", weight: 0.85 },
  { id: "hn-frontpage", type: "hn", name: "HN", weight: 0.5 },
  { id: "the-verge", type: "rss", name: "The Verge", weight: 0.6 },
];

describe("computeSignalStrength", () => {
  it("returns 0 when nothing is cited", () => {
    expect(computeSignalStrength({ cited: [], registry })).toBe(0);
  });

  it("rises with both diversity and weight", () => {
    const high = computeSignalStrength({
      cited: [
        { id: "anthropic-news" },
        { id: "openai-blog" },
        { id: "deepmind-blog" },
        { id: "the-verge" },
      ],
      registry,
    });
    const low = computeSignalStrength({
      cited: [{ id: "hn-frontpage" }],
      registry,
    });
    expect(high).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(70);
    expect(high).toBeLessThanOrEqual(100);
  });

  it("deduplicates repeated source ids", () => {
    const once = computeSignalStrength({
      cited: [{ id: "anthropic-news" }],
      registry,
    });
    const repeated = computeSignalStrength({
      cited: [
        { id: "anthropic-news" },
        { id: "anthropic-news" },
        { id: "anthropic-news" },
      ],
      registry,
    });
    expect(once).toBe(repeated);
  });

  it("falls back to 0.5 weight for unknown sources", () => {
    const known = computeSignalStrength({
      cited: [{ id: "anthropic-news" }],
      registry,
    });
    const unknown = computeSignalStrength({
      cited: [{ id: "mystery-source" }],
      registry,
    });
    expect(known).toBeGreaterThan(unknown);
  });
});
