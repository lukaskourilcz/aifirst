import { describe, it, expect } from "vitest";
import { wordCount, readingMinutes, slugify } from "../text.js";

describe("wordCount", () => {
  it("returns 0 for empty input", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
  });

  it("counts plain words", () => {
    expect(wordCount("one two three")).toBe(3);
  });

  it("ignores code fences", () => {
    expect(wordCount("hello\n\n```\nignored words here\n```\nworld")).toBe(2);
  });

  it("strips inline code and link syntax", () => {
    expect(wordCount("see [the docs](https://example.com) please")).toBe(4);
    expect(wordCount("`code` plain")).toBe(1);
  });
});

describe("readingMinutes", () => {
  it("never returns less than 1", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("a b c")).toBe(1);
  });

  it("uses 220 wpm rounding", () => {
    const text = Array.from({ length: 440 }, () => "word").join(" ");
    expect(readingMinutes(text)).toBe(2);
  });
});

describe("slugify", () => {
  it("lowercases and dashifies", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips punctuation", () => {
    expect(slugify("What's next, really?")).toBe("whats-next-really");
  });

  it("collapses repeated dashes and whitespace", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });
});
