import { describe, expect, it } from "vitest";
import { atomDocument, atomEntry, feedUpdated, imageMimeType } from "../feed";
import { atomFeedErrors } from "../feed-validation";

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

  it("declares the enclosure's real media type", () => {
    // Seven delivered editions ship a drawn .svg plate; announcing them as
    // WebP was the feeds' only content-type lie.
    expect(imageMimeType("https://example.com/a/hero.svg")).toBe("image/svg+xml");
    expect(imageMimeType("https://example.com/a/hero.webp")).toBe("image/webp");
    expect(imageMimeType("https://example.com/a/hero.JPG")).toBe("image/jpeg");
    const drawn = atomEntry({
      title: "Drawn plate",
      url: "https://example.com/articles/b",
      published: "2026-08-14",
      summary: "Summary",
      language: "cs",
      imageUrl: "https://example.com/images/editions/b/hero.svg",
      imageLength: 4096,
    });
    expect(drawn).toContain('rel="enclosure" type="image/svg+xml" length="4096"');
  });

  it("names the publication as the feed author", () => {
    const document = atomDocument({
      title: "DNESKAi",
      alternateHref: "https://example.com/",
      selfHref: "https://example.com/feed.xml",
      id: "https://example.com/",
      updated: feedUpdated("2026-08-20"),
      language: "cs",
      entries: [],
      author: { name: "DNESKAi", uri: "https://example.com" },
    });
    expect(document).toContain("<name>DNESKAi</name>");
    expect(document).toContain("<uri>https://example.com</uri>");
  });

  it("assembles into a document the Atom validator accepts", () => {
    const document = atomDocument({
      title: "DNESKAi",
      alternateHref: "https://example.com/",
      selfHref: "https://example.com/feed.xml",
      id: "https://example.com/",
      updated: feedUpdated("2026-08-20"),
      language: "cs",
      author: { name: "DNESKAi", uri: "https://example.com" },
      entries: [
        atomEntry({
          title: "A & B",
          url: "https://example.com/articles/a?x=1&y=2",
          published: "2026-07-20",
          updated: "2026-07-21",
          summary: "Measured summary",
          categories: ["models"],
          language: "cs",
          imageUrl: "https://example.com/a.webp",
          related: [{ url: "https://source.example/?a=1&b=2", title: "Source: Example" }],
        }),
      ],
    });
    expect(atomFeedErrors(document)).toEqual([]);
  });

  it("is deterministic for an empty publication", () => {
    expect(feedUpdated()).toBe("1970-01-01T00:00:00Z");
    expect(atomDocument({ title: "Caught Up", alternateHref: "https://example.com", selfHref: "https://example.com/feed.xml", id: "https://example.com", updated: feedUpdated(), language: "cs", entries: [] })).toContain('xml:lang="cs"');
  });
});
