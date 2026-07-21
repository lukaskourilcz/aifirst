import { describe, expect, it } from "vitest";
import { compareTopicWindows } from "../radar";

describe("Radar topic windows", () => {
  it("identifies rising and cooling tags deterministically", () => {
    const comparison = compareTopicWindows([
      { slug: "4", date: "2026-07-04", title: "4", tags: ["rising"] },
      { slug: "3", date: "2026-07-03", title: "3", tags: ["rising"] },
      { slug: "2", date: "2026-07-02", title: "2", tags: ["cooling"] },
      { slug: "1", date: "2026-07-01", title: "1", tags: ["cooling"] },
    ]);
    expect(comparison.find((item) => item.tag === "rising")?.delta).toBe(2);
    expect(comparison.find((item) => item.tag === "cooling")?.delta).toBe(-2);
  });
});
