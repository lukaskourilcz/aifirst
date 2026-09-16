import { describe, expect, it } from "vitest";
import { atomFeedErrors, parseXml } from "../feed-validation";

function feed(body: string, opts: { author?: boolean } = {}): string {
  const author = opts.author === false ? "" : "\n  <author>\n    <name>DNESKAi</name>\n  </author>";
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="cs">
  <title>DNESKAi</title>
  <link href="https://example.test/" rel="alternate"/>
  <link href="https://example.test/feed.xml" rel="self" type="application/atom+xml"/>
  <id>https://example.test/</id>
  <updated>2026-08-20T06:00:00Z</updated>${author}
${body}
</feed>
`;
}

function entry(overrides: Partial<Record<"id" | "published" | "updated" | "enclosure", string>> = {}): string {
  const id = overrides.id ?? "https://example.test/articles/a";
  const published = overrides.published ?? "2026-08-20T06:00:00Z";
  const updated = overrides.updated ?? "2026-08-20T06:00:00Z";
  const enclosure =
    overrides.enclosure ?? '<link href="https://example.test/a/hero.svg" rel="enclosure" type="image/svg+xml"/>';
  return `  <entry xml:lang="cs">
    <title>Headline</title>
    <link href="${id}"/>
    <id>${id}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>Measured summary</summary>
    ${enclosure}
  </entry>`;
}

describe("the XML scan", () => {
  it("reads a well-formed document into a tree", () => {
    const { root, errors } = parseXml(feed(entry()));
    expect(errors).toEqual([]);
    expect(root?.name).toBe("feed");
    expect(root?.children.filter((child) => child.name === "entry")).toHaveLength(1);
  });

  it("reports a mismatched, unclosed or duplicated structure", () => {
    expect(parseXml("<a><b></a></b>").errors[0]).toContain("closed by");
    expect(parseXml("<a><b></a>").errors.join(" ")).toContain("closed by");
    expect(parseXml("<a></a><c></c>").errors.join(" ")).toContain("a second root element");
    expect(parseXml("<a>").errors.join(" ")).toContain("is never closed");
  });

  it("rejects unquoted attribute values and raw ampersands", () => {
    expect(parseXml('<a href=x/>').errors.join(" ")).toContain("double-quoted");
    expect(parseXml("<a>Q &amp; A</a>").errors).toEqual([]);
    expect(parseXml("<a>Q & A</a>").errors.join(" ")).toContain("unescaped");
    expect(parseXml('<a href="q&a"/>').errors.join(" ")).toContain("unescaped");
  });
});

describe("Atom validity", () => {
  it("accepts a complete feed", () => {
    expect(atomFeedErrors(feed(entry()))).toEqual([]);
  });

  it("requires the Atom namespace and a feed root", () => {
    expect(atomFeedErrors("<rss></rss>").join(" ")).toContain("not <feed>");
    expect(atomFeedErrors(feed(entry()).replace('xmlns="http://www.w3.org/2005/Atom"', "")).join(" ")).toContain(
      "Atom namespace",
    );
  });

  it("requires an author on the feed or on every entry", () => {
    const errors = atomFeedErrors(feed(entry(), { author: false }));
    expect(errors).toContain("entry 1: no <author> here and none on the feed");
    const perEntry = feed(entry(), { author: false }).replace(
      "    <summary>Measured summary</summary>",
      "    <summary>Measured summary</summary>\n    <author><name>DNESKAi</name></author>",
    );
    expect(atomFeedErrors(perEntry)).toEqual([]);
  });

  it("requires a self link that declares the Atom media type", () => {
    const withoutSelf = feed(entry()).replace(
      '  <link href="https://example.test/feed.xml" rel="self" type="application/atom+xml"/>\n',
      "",
    );
    expect(atomFeedErrors(withoutSelf)).toContain('feed: missing <link rel="self">');
    const wrongType = feed(entry()).replace('rel="self" type="application/atom+xml"', 'rel="self" type="text/xml"');
    expect(atomFeedErrors(wrongType)).toContain('feed: <link rel="self"> must declare type="application/atom+xml"');
  });

  it("requires RFC 3339 timestamps, not bare dates", () => {
    expect(atomFeedErrors(feed(entry({ updated: "2026-08-20" })))).toContain(
      'entry 1: <updated> "2026-08-20" is not an RFC 3339 date-time',
    );
    expect(atomFeedErrors(feed(entry()).replace("<updated>2026-08-20T06:00:00Z</updated>", "<updated>2026-08-20</updated>"))).toContain(
      'feed: <updated> "2026-08-20" is not an RFC 3339 date-time',
    );
  });

  it("rejects duplicate entry ids", () => {
    const errors = atomFeedErrors(feed(`${entry()}\n${entry()}`));
    expect(errors).toContain("entry 2: duplicate <id> https://example.test/articles/a");
  });

  it("requires a media type on every enclosure", () => {
    const errors = atomFeedErrors(
      feed(entry({ enclosure: '<link href="https://example.test/a/hero.svg" rel="enclosure"/>' })),
    );
    expect(errors).toContain("entry 1: enclosure <link> without a type");
  });

  it("requires an entry to carry a summary or a content", () => {
    const errors = atomFeedErrors(feed(entry().replace("    <summary>Measured summary</summary>\n", "")));
    expect(errors).toContain("entry 1: needs a <summary> or a <content>");
  });

  it("reports an unescaped ampersand in character data", () => {
    expect(atomFeedErrors(feed(entry()).replace("<title>Headline</title>", "<title>Q & A</title>")).join(" ")).toContain(
      "unescaped",
    );
  });
});
