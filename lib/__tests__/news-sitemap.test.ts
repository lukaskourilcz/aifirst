import { beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  NEWS_SITEMAP_MAX_ENTRIES,
  NEWS_WINDOW_DAYS,
  newsSitemapDocument,
  newsUrl,
  newsWindowStart,
} from "../feed.js";
import { newsSitemapErrors } from "../feed-validation.js";
import { buildNewsSitemap } from "../feeds.js";

function fixture(opts: { slug: string; date: string; title: string; lang?: string }): string {
  return `---
title: ${opts.title}
slug: ${opts.slug}
date: "${opts.date}"
dek: Dek for ${opts.slug}
lang: ${opts.lang ?? "cs"}
tags: [ai]
sources: []
illustration:
  path: /images/editions/${opts.slug}/hero.webp
  prompt: p
  alt: a
---

Body of ${opts.slug}.
`;
}

describe("the news window", () => {
  it("covers two days counted back from the newest edition", () => {
    expect(NEWS_WINDOW_DAYS).toBe(2);
    expect(newsWindowStart("2026-09-13")).toBe("2026-09-12");
  });

  it("crosses month and year boundaries", () => {
    expect(newsWindowStart("2026-09-01")).toBe("2026-08-31");
    expect(newsWindowStart("2026-01-01")).toBe("2025-12-31");
    expect(newsWindowStart("2028-03-01")).toBe("2028-02-29");
  });

  it("accepts a full timestamp and leaves anything unparseable alone", () => {
    expect(newsWindowStart("2026-09-13T06:00:00Z")).toBe("2026-09-12");
    expect(newsWindowStart("not a date")).toBe("not a date");
  });
});

describe("the news sitemap document", () => {
  it("escapes every interpolated value and resolves a bare date to the publishing slot", () => {
    const url = newsUrl({
      url: "https://example.test/articles/a?x=1&y=2",
      title: "Q & A",
      published: "2026-09-13",
      language: "cs",
      publication: "DNESKAi",
    });
    expect(url).toContain("<loc>https://example.test/articles/a?x=1&amp;y=2</loc>");
    expect(url).toContain("<news:title>Q &amp; A</news:title>");
    expect(url).toContain("<news:publication_date>2026-09-13T06:00:00Z</news:publication_date>");
    expect(url).toContain("<news:name>DNESKAi</news:name>");
    expect(url).toContain("<news:language>cs</news:language>");
  });

  it("keeps a delivered timestamp and a legacy English language as they are", () => {
    const url = newsUrl({
      url: "https://example.test/articles/b",
      title: "Legacy",
      published: "2026-05-12T04:11:00Z",
      language: "en",
      publication: "DNESKAi",
    });
    expect(url).toContain("<news:publication_date>2026-05-12T04:11:00Z</news:publication_date>");
    expect(url).toContain("<news:language>en</news:language>");
  });

  it("declares both namespaces and stays well-formed with no entries", () => {
    const empty = newsSitemapDocument([]);
    expect(empty).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(empty).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    expect(empty).toContain("<urlset");
    expect(newsSitemapErrors(empty)).toEqual([]);
  });

  it("assembles into a document the sitemap validator accepts", () => {
    const document = newsSitemapDocument([
      newsUrl({
        url: "https://example.test/articles/a",
        title: "A",
        published: "2026-09-13",
        language: "cs",
        publication: "DNESKAi",
      }),
      newsUrl({
        url: "https://example.test/articles/b",
        title: "B",
        published: "2026-09-12",
        language: "en",
        publication: "DNESKAi",
      }),
    ]);
    expect(newsSitemapErrors(document)).toEqual([]);
  });
});

describe("the news sitemap validator", () => {
  const good = newsUrl({
    url: "https://example.test/articles/a",
    title: "A",
    published: "2026-09-13",
    language: "cs",
    publication: "DNESKAi",
  });

  it("rejects a missing namespace, a relative loc and a duplicate loc", () => {
    const noNamespace = newsSitemapDocument([good]).replace(
      ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"',
      "",
    );
    expect(newsSitemapErrors(noNamespace).join(" ")).toContain("xmlns:news");

    const relative = newsSitemapDocument([good]).replace("https://example.test/articles/a", "/articles/a");
    expect(newsSitemapErrors(relative).join(" ")).toContain("not an absolute");

    expect(newsSitemapErrors(newsSitemapDocument([good, good])).join(" ")).toContain("duplicate <loc>");
  });

  it("rejects a bare date, a missing title and a bad language code", () => {
    const bareDate = newsSitemapDocument([good]).replace("2026-09-13T06:00:00Z", "2026-09-13");
    expect(newsSitemapErrors(bareDate).join(" ")).toContain("RFC 3339");

    const noTitle = newsSitemapDocument([good]).replace("<news:title>A</news:title>", "");
    expect(newsSitemapErrors(noTitle).join(" ")).toContain("missing <title>");

    const badLanguage = newsSitemapDocument([good]).replace(
      "<news:language>cs</news:language>",
      "<news:language>Czech (CZ)</news:language>",
    );
    expect(newsSitemapErrors(badLanguage).join(" ")).toContain("is not a language code");
  });

  it("rejects a url with no news block and a document over the entry cap", () => {
    const noNews = newsSitemapDocument(["  <url>\n    <loc>https://example.test/a</loc>\n  </url>"]);
    expect(newsSitemapErrors(noNews).join(" ")).toContain("missing <news:news>");

    const oversized = newsSitemapDocument(
      Array.from({ length: NEWS_SITEMAP_MAX_ENTRIES + 1 }, (_, index) =>
        newsUrl({
          url: `https://example.test/articles/a-${index}`,
          title: `A ${index}`,
          published: "2026-09-13",
          language: "cs",
          publication: "DNESKAi",
        }),
      ),
    );
    expect(newsSitemapErrors(oversized).join(" ")).toContain("entry limit");
  });
});

describe("buildNewsSitemap", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-news-"));
    await fs.writeFile(
      path.join(dir, "2026-09-13.mdx"),
      fixture({ slug: "newest", date: "2026-09-13", title: "Newest & best" }),
    );
    await fs.writeFile(
      path.join(dir, "2026-09-12.mdx"),
      fixture({ slug: "yesterday", date: "2026-09-12", title: "Yesterday" }),
    );
    await fs.writeFile(
      path.join(dir, "2026-09-05.mdx"),
      fixture({ slug: "older", date: "2026-09-05", title: "Older" }),
    );
  });

  it("lists only the editions inside the window, anchored to the newest date", async () => {
    const xml = await buildNewsSitemap("cs", dir);
    expect(xml).toContain("/articles/newest<");
    expect(xml).toContain("/articles/yesterday<");
    expect(xml).not.toContain("/articles/older<");
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it("names the publication, escapes the headline and dates the publishing slot", async () => {
    const xml = await buildNewsSitemap("cs", dir);
    expect(xml).toContain("<news:name>DNESKAi</news:name>");
    expect(xml).toContain("<news:title>Newest &amp; best</news:title>");
    expect(xml).toContain("<news:publication_date>2026-09-13T06:00:00Z</news:publication_date>");
  });

  it("produces a document the validator accepts, and the same bytes twice", async () => {
    const first = await buildNewsSitemap("cs", dir);
    const second = await buildNewsSitemap("cs", dir);
    expect(newsSitemapErrors(first)).toEqual([]);
    expect(second).toBe(first);
  });

  it("is an empty but valid document when there is nothing to list", async () => {
    const empty = await buildNewsSitemap("cs", path.join(dir, "missing"));
    expect(empty).not.toContain("<url>");
    expect(newsSitemapErrors(empty)).toEqual([]);
  });
});
