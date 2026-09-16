import { describe, expect, it } from "vitest";
import {
  LARGE_IMAGE_MIN_WIDTH,
  articleGraph,
  articleNode,
  imageNode,
  indexableHero,
  lastModifiedAt,
  organizationId,
  organizationNode,
  publishedAt,
} from "../editorial/structured-data";

const BASE = "https://example.test";

const baseFrontmatter = {
  title: "Edition headline",
  dek: "One measured sentence about the day.",
  date: "2026-08-20",
};

const real = () => true;
const none = () => false;

describe("publication timestamps", () => {
  it("falls back to the 06:00 UTC publishing slot", () => {
    expect(publishedAt({ date: "2026-08-20" })).toBe("2026-08-20T06:00:00Z");
    expect(lastModifiedAt({ date: "2026-08-20" })).toBe("2026-08-20T06:00:00Z");
  });

  it("prefers the delivered timestamp over the slot", () => {
    const fm = { date: "2026-08-20", generation: { generated_at: "2026-08-20T03:11:00Z" } };
    expect(publishedAt(fm)).toBe("2026-08-20T03:11:00Z");
    expect(lastModifiedAt(fm)).toBe("2026-08-20T03:11:00Z");
  });

  it("reports the newest correction as the modification date", () => {
    const fm = {
      date: "2026-08-20",
      generation: { generated_at: "2026-08-20T03:11:00Z" },
      corrections: [{ date: "2026-08-22" }, { date: "2026-08-25" }, { date: "2026-08-21" }],
    };
    expect(lastModifiedAt(fm)).toBe("2026-08-25T00:00:00Z");
    // A correction never moves the publication date.
    expect(publishedAt(fm)).toBe("2026-08-20T03:11:00Z");
  });
});

describe("the indexable hero", () => {
  it("carries the delivered dimensions", () => {
    expect(
      indexableHero({ illustration: { path: "/images/editions/x/hero.webp", width: 1600, height: 900 } }, real),
    ).toEqual({ path: "/images/editions/x/hero.webp", width: 1600, height: 900 });
  });

  it("is null when the edition has no picture of its own", () => {
    expect(indexableHero({}, real)).toBeNull();
    expect(indexableHero({ illustration: { path: "/illustrations/placeholder.webp" } }, none)).toBeNull();
  });

  it("never promotes a cached source thumbnail", () => {
    // `resolveHeroPhoto` may fall through to /og-cache/*.webp for a card;
    // those are 480x360 pictures of somebody else's page and must not become
    // the declared article image.
    const fm = {
      illustration: {},
      sources: [{ url: "https://news.example/story" }],
    };
    expect(indexableHero(fm, real)).toBeNull();
  });
});

describe("the article image node", () => {
  it("is an ImageObject once the hero clears the large-preview floor", () => {
    expect(imageNode({ path: "/images/editions/x/hero.webp", width: 1600, height: 900 }, BASE)).toEqual({
      "@type": "ImageObject",
      url: `${BASE}/images/editions/x/hero.webp`,
      width: 1600,
      height: 900,
    });
  });

  it("is a bare crawlable URL for an undimensioned legacy hero", () => {
    expect(imageNode({ path: "/illustrations/2026-05-10.webp" }, BASE)).toBe(
      `${BASE}/illustrations/2026-05-10.webp`,
    );
  });

  it("does not claim a large preview for a narrow picture", () => {
    const narrow = imageNode({ path: "/og-cache/abc.webp", width: 480, height: 360 }, BASE);
    expect(narrow).toBe(`${BASE}/og-cache/abc.webp`);
    expect(LARGE_IMAGE_MIN_WIDTH).toBe(1200);
  });

  it("is absent when there is no hero", () => {
    expect(imageNode(null, BASE)).toBeUndefined();
    expect(articleNode({ fm: baseFrontmatter, base: BASE, url: `${BASE}/a`, inLanguage: "cs" })).not.toHaveProperty(
      "image",
    );
  });
});

describe("the article node", () => {
  it("names a daily edition a NewsArticle and a weekly one an Article", () => {
    const daily = articleNode({ fm: baseFrontmatter, base: BASE, url: `${BASE}/a`, inLanguage: "cs" });
    const weekly = articleNode({
      fm: baseFrontmatter,
      base: BASE,
      url: `${BASE}/a`,
      inLanguage: "cs",
      isWeekly: true,
    });
    expect(daily["@type"]).toBe("NewsArticle");
    expect(weekly["@type"]).toBe("Article");
  });

  it("carries the Article reference fields", () => {
    const node = articleNode({
      fm: { ...baseFrontmatter, corrections: [{ date: "2026-08-24" }] },
      base: BASE,
      url: `${BASE}/articles/x`,
      inLanguage: "cs",
      about: ["Modely"],
      hero: { path: "/images/editions/x/hero.webp", width: 1600, height: 900 },
    });
    expect(node.headline).toBe("Edition headline");
    expect(node.datePublished).toBe("2026-08-20T06:00:00Z");
    expect(node.dateModified).toBe("2026-08-24T00:00:00Z");
    expect(node.mainEntityOfPage).toBe(`${BASE}/articles/x`);
    expect(node.isAccessibleForFree).toBe(true);
    expect(node.about).toEqual(["Modely"]);
    expect(node.author).toEqual({ "@id": organizationId(BASE) });
    expect(node.publisher).toEqual({ "@id": organizationId(BASE) });
  });

  it("omits an empty topic list rather than declaring an empty subject", () => {
    expect(articleNode({ fm: baseFrontmatter, base: BASE, url: `${BASE}/a`, inLanguage: "cs" })).not.toHaveProperty(
      "about",
    );
  });
});

describe("the article graph", () => {
  const graph = articleGraph({
    fm: baseFrontmatter,
    base: BASE,
    url: `${BASE}/articles/x`,
    inLanguage: "cs",
    organizationName: "DNESKAi",
    hero: { path: "/images/editions/x/hero.webp", width: 1600, height: 900 },
    breadcrumbs: [
      { name: "DNESKAi", item: `${BASE}/` },
      { name: "Archiv", item: `${BASE}/archive` },
      { name: "Edition headline", item: `${BASE}/articles/x` },
    ],
  });
  const nodes = graph["@graph"] as Array<Record<string, unknown>>;

  it("resolves author and publisher inside its own graph", () => {
    const article = nodes.find((node) => node["@type"] === "NewsArticle");
    const organization = nodes.find((node) => node["@type"] === "Organization");
    expect(organization?.["@id"]).toBe(organizationId(BASE));
    expect(article?.author).toEqual({ "@id": organization?.["@id"] });
    expect(article?.publisher).toEqual({ "@id": organization?.["@id"] });
  });

  it("gives the publisher a name, a URL and a logo", () => {
    const organization = organizationNode({ base: BASE, name: "DNESKAi" });
    expect(organization.name).toBe("DNESKAi");
    expect(organization.url).toBe(BASE);
    expect(organization.logo).toEqual({ "@type": "ImageObject", url: `${BASE}/brand/completion-mark.svg` });
  });

  it("numbers the breadcrumb trail in order", () => {
    const breadcrumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
    expect((breadcrumbs?.itemListElement as Array<{ position: number }>).map((item) => item.position)).toEqual([
      1, 2, 3,
    ]);
  });
});
