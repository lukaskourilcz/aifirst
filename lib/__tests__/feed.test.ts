import { describe, expect, it } from "vitest";
import { atomDocument, atomEntry, feedUpdated } from "../feed";

describe("Atom feeds", () => {
  it("emits language, publication, corrections, categories and attribution links", () => {
    const entry = atomEntry({
      title: "A & B",
      url: "https://example.com/articles/a?x=1&y=2",
      published: "2026-07-20",
      updated: "2026-07-21",
      summary: "Measured summary",
      categories: ["models", "research"],
      language: "en",
      imageUrl: "https://example.com/a.webp",
      related: [{ url: "https://source.example/?a=1&b=2", title: "Source: Example" }],
    });
    expect(entry).toContain('xml:lang="en"');
    expect(entry).toContain("<published>2026-07-20T06:00:00Z</published>");
    expect(entry).toContain("<updated>2026-07-21T06:00:00Z</updated>");
    expect(entry.match(/<category/g)).toHaveLength(2);
    expect(entry).toContain('rel="enclosure"');
    expect(entry).toContain('rel="related"');
    expect(entry).toContain("&amp;");
  });

  it("is deterministic for an empty publication", () => {
    expect(feedUpdated()).toBe("1970-01-01T00:00:00Z");
    expect(atomDocument({ title: "Caught Up", alternateHref: "https://example.com", selfHref: "https://example.com/feed.xml", id: "https://example.com", updated: feedUpdated(), language: "cs", entries: [] })).toContain('xml:lang="cs"');
  });
});
