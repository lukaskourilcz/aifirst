import fs from "node:fs";
import path from "node:path";
import Ajv2020, { type AnySchema } from "ajv/dist/2020.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Article } from "../../content";
import { createArticleDistributionPack, distributionPackFile, socialCopyFor, withUtm } from "../share";

const SITE = "https://dneskai.example";

function sampleArticle(over: Partial<Article["frontmatter"]> = {}): Article {
  return {
    slug: "2026-11-05-ukazka",
    lang: "cs",
    fallback: false,
    mdx: "Tělo vydání.",
    frontmatter: {
      schema_version: 2,
      title: "Ukázkové vydání pro kontrakt share packu",
      slug: "2026-11-05-ukazka",
      date: "2026-11-05",
      lang: "cs",
      dek: "Perex ukázkového vydání, který shrnuje hlavní vývoj dne ve dvou větách.",
      tags: ["umela-inteligence"],
      sources: [{ id: "s1", url: "https://example.com/a", title: "Zdroj" }],
      illustration: { alt: "Popis obrázku" },
      why_it_matters: ["Proč na tom záleží."],
      ...over,
    },
  };
}

const practical = {
  type: "tool",
  title: "NotebookLM umí shrnout PDF do audia",
  text: "Nahrajte výroční zprávu a nechte si vygenerovat desetiminutový podcast se shrnutím.",
  url: "https://notebooklm.google.com",
  verified_at: "2026-11-04",
};

const socialCopy = {
  igCaption: "Útočník sestavil tři volně dostupné AI nástroje a napadl přes 27 firem.",
  hashtags: ["umelainteligence", "aiagenti"],
  threadsText: "Útočník propojil tři open-source AI agenty a pronikl do nejméně 27 firem.",
  storyLine: "AI agenti jako útočný nástroj: 27 firem, 25 dolarů za cíl",
};

function validator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const schema = JSON.parse(fs.readFileSync(path.join(process.cwd(), "contracts", "distribution-pack.schema.json"), "utf8")) as AnySchema;
  return ajv.compile(schema);
}

describe("distribution pack v2 (share JSON)", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  beforeEach(() => { process.env.NEXT_PUBLIC_SITE_URL = SITE; });
  afterEach(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  });

  it("keeps the v1 fields and adds social copy, lesson, practical, images and links", () => {
    const pack = createArticleDistributionPack(sampleArticle({ practical, social_copy: socialCopy }), "cs");
    expect(pack.schemaVersion).toBe(2);
    expect(pack.canonicalUrl).toBe(`${SITE}/articles/2026-11-05-ukazka`);
    expect(pack.primaryHeadline).toBe("Ukázkové vydání pro kontrakt share packu");
    expect(pack.markdownUrl).toBe(`${SITE}/articles/2026-11-05-ukazka.md`);
    expect(pack.images.og).toEqual({ url: `${SITE}/articles/2026-11-05-ukazka/share/og.png`, width: 1200, height: 630 });
    expect(pack.images.feed).toEqual({ url: `${SITE}/articles/2026-11-05-ukazka/share/feed.png`, width: 1080, height: 1350 });
    expect(pack.images.story).toEqual({ url: `${SITE}/articles/2026-11-05-ukazka/share/story.png`, width: 1080, height: 1920 });
    expect(pack.social_copy).toEqual({ ...socialCopy, origin: "edition" });
    expect(pack.lesson?.url).toMatch(new RegExp(`^${SITE}/lekce#`));
    expect(pack.practical?.items[0]).toEqual(practical);
    expect(pack.links.threadsPost).toBe(`${SITE}/articles/2026-11-05-ukazka?utm_source=threads&utm_medium=post&utm_campaign=edition`);
    expect(pack.links.practicalStory).toBe(`${SITE}/articles/2026-11-05-ukazka?utm_source=instagram&utm_medium=story&utm_campaign=practical`);
    const validate = validator();
    expect(validate(pack), JSON.stringify(validate.errors)).toBe(true);
  });

  it("stays honest without practical or upstream social copy", () => {
    const pack = createArticleDistributionPack(sampleArticle(), "cs");
    expect(pack.practical).toBeNull();
    expect(pack.links.practicalStory).toBeNull();
    expect(pack.social_copy.origin).toBe("derived");
    expect(pack.social_copy.storyLine).toBe("Ukázkové vydání pro kontrakt share packu");
    expect(pack.social_copy.threadsText.length).toBeLessThanOrEqual(500);
    const validate = validator();
    expect(validate(pack), JSON.stringify(validate.errors)).toBe(true);
  });

  it("has no lesson before the curriculum starts", () => {
    expect(createArticleDistributionPack(sampleArticle({ date: "2026-05-10" }), "cs").lesson).toBeNull();
  });

  it("falls back to derived copy when the upstream copy is incomplete or too long", () => {
    expect(socialCopyFor(sampleArticle({ social_copy: { igCaption: "x" } }).frontmatter).origin).toBe("derived");
    expect(socialCopyFor(sampleArticle({ social_copy: { ...socialCopy, threadsText: "x".repeat(501) } }).frontmatter).origin).toBe("derived");
    const tags = socialCopyFor(sampleArticle({ social_copy: { ...socialCopy, hashtags: ["ok", "#bad", "two words", 3] } }).frontmatter).hashtags;
    expect(tags).toEqual(["ok"]);
  });

  it("names the file by date, with a weekly suffix", () => {
    expect(distributionPackFile(sampleArticle(), "cs")).toBe("2026-11-05.cs.json");
    expect(distributionPackFile(sampleArticle({ type: "weekly" }), "cs")).toBe("2026-11-05.weekly.cs.json");
  });

  it("builds UTM links in the CONTRACTS.md §4 order", () => {
    expect(withUtm(`${SITE}/`, "instagram", "bio", "launch-2026-11")).toBe(`${SITE}/?utm_source=instagram&utm_medium=bio&utm_campaign=launch-2026-11`);
  });
});
