import { describe, it, expect } from "vitest";
import { stableId, clampSummary, withTimeout } from "../util.js";

describe("stableId", () => {
  it("is deterministic for the same url", () => {
    expect(stableId("https://example.com/a")).toBe(stableId("https://example.com/a"));
  });

  it("differs for different urls", () => {
    expect(stableId("https://example.com/a")).not.toBe(stableId("https://example.com/b"));
  });

  it("returns a 16-char hex slice", () => {
    expect(stableId("https://example.com/a")).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("clampSummary", () => {
  it("returns an empty string for nullish input", () => {
    expect(clampSummary(undefined)).toBe("");
  });

  it("strips HTML tags", () => {
    expect(clampSummary("<p>hello <b>world</b></p>")).toBe("hello world");
  });

  it("collapses whitespace", () => {
    expect(clampSummary("a\n\nb   c\t")).toBe("a b c");
  });

  it("clamps to the maximum length", () => {
    const long = "x".repeat(800);
    const out = clampSummary(long, 500);
    expect(out.length).toBe(500);
    expect(out.endsWith("…")).toBe(true);
  });

  it("does not clamp if under the limit", () => {
    expect(clampSummary("short", 500)).toBe("short");
  });
});

describe("withTimeout", () => {
  it("resolves when the promise resolves first", async () => {
    const result = await withTimeout(Promise.resolve(42), 100);
    expect(result).toBe(42);
  });

  it("rejects when the timeout fires first", async () => {
    const slow = new Promise<number>((resolve) => setTimeout(() => resolve(1), 50));
    await expect(withTimeout(slow, 10)).rejects.toThrow(/timeout/);
  });
});
