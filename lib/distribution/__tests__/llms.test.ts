import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleMarkdownPath, buildArticleMarkdown, buildLlmsIndex, MAX_INDEX_EDITIONS } from "../llms";
import { heldArticleSlugs } from "../../editorial-holds";
import type { Article } from "../../content";

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

function article(overrides: Partial<Article["frontmatter"]> = {}, mdx = "Tělo vydání."): Article {
  return {
    slug: "2026-07-21-test",
    lang: "cs",
    fallback: false,
    mdx,
    frontmatter: {
      title: "Titulek vydání",
      slug: "2026-07-21-test",
      date: "2026-07-21",
      dek: "Perex vydání.",
      tags: ["umela-inteligence", "regulace"],
      sources: [
        { id: "s1", url: "https://example.com/a", title: "První zdroj", publisher: "Example" },
        { id: "s2", url: "https://example.com/b", title: "Druhý zdroj" },
      ],
      illustration: { alt: "" },
      type: "daily",
      ...overrides,
    },
  };
}

describe("buildArticleMarkdown", () => {
  it("leads with the title, the dek and the canonical URL", () => {
    const md = buildArticleMarkdown(article(), "cs");
    expect(md.startsWith("# Titulek vydání\n")).toBe(true);
    expect(md).toContain("> Perex vydání.");
    expect(md).toContain("- vydání: 2026-07-21");
    expect(md).toContain("- témata: umela-inteligence, regulace");
    expect(md).toContain("- URL: https://");
    expect(md).toContain("/articles/2026-07-21-test");
    expect(md).toContain("Tělo vydání.");
    expect(md.endsWith("\n")).toBe(true);
  });

  it("names every cited source and links its URL", () => {
    const md = buildArticleMarkdown(article(), "cs");
    expect(md).toContain("## Zdroje");
    expect(md).toContain("[První zdroj](https://example.com/a) (Example)");
    expect(md).toContain("[Druhý zdroj](https://example.com/b)");
  });

  it("emits the highlight sections only when the edition carries them", () => {
    const without = buildArticleMarkdown(article(), "cs");
    expect(without).not.toContain("## Proč na tom záleží");
    expect(without).not.toContain("## Co zůstává nejisté");

    const with_ = buildArticleMarkdown(
      article({ why_it_matters: ["Důvod."], what_changed: ["Změna."], uncertainty: ["Nejistota."] }),
      "cs",
    );
    expect(with_).toContain("## Proč na tom záleží\n\n- Důvod.");
    expect(with_).toContain("## Co se změnilo\n\n- Změna.");
    expect(with_).toContain("## Co zůstává nejisté\n\n- Nejistota.");
  });

  it("emits Briefs and Watchlist only when they have entries", () => {
    const bare = buildArticleMarkdown(article(), "cs");
    expect(bare).not.toContain("## Ve zkratce");
    expect(bare).not.toContain("## Na radaru");

    const full = buildArticleMarkdown(
      article({
        dispatches: [{ title: "Zpráva", body: "Tělo zprávy.", source_url: "https://example.com/c" }],
        wire: [{ title: "Odkaz", url: "https://example.com/d", source: "Example" }],
      }),
      "cs",
    );
    expect(full).toContain("## Ve zkratce");
    expect(full).toContain("### Zpráva");
    expect(full).toContain("[zdroj](https://example.com/c)");
    expect(full).toContain("## Na radaru");
    expect(full).toContain("[Odkaz](https://example.com/d) (Example)");
  });

  it("keeps sponsorship labelled and corrections visible", () => {
    const md = buildArticleMarkdown(
      article({
        sponsor: { name: "Partner", url: "https://example.com/p", label: "Partner", copy: "Text partnera." },
        corrections: [{ date: "2026-07-22", description: "Opraveno číslo.", section: "úvod" }],
      }),
      "cs",
    );
    expect(md).toContain("Sponzorováno: [Partner](https://example.com/p). Text partnera.");
    expect(md).toContain("## Opravy");
    expect(md).toContain("- 2026-07-22 (úvod): Opraveno číslo.");
  });

  it("carries no production instrumentation from the generation block", () => {
    const md = buildArticleMarkdown(
      article({
        generation: {
          generated_at: "2026-07-21T03:00:00.000Z",
          human_reviewed: false,
          models: { curation: "claude-sonnet-4-6", writing: "claude-sonnet-4-6" },
          source_candidates: 80,
          cited_sources: 2,
          cost: { amount: 0.15, currency: "USD" },
          package_hash: "abc123",
        },
        signal_strength: 74,
      }),
      "cs",
    );
    for (const leak of ["claude-sonnet", "USD", "0.15", "abc123", "source_candidates", "80", "74"]) {
      expect(md, leak).not.toContain(leak);
    }
  });

  it("is byte-identical across calls", () => {
    expect(buildArticleMarkdown(article(), "cs")).toBe(buildArticleMarkdown(article(), "cs"));
  });

  it("does not break its own links on bracketed titles", () => {
    const md = buildArticleMarkdown(
      article({ sources: [{ id: "s1", url: "https://example.com/x", title: "Titulek [s závorkou]" }] }),
      "cs",
    );
    expect(md).toContain("[Titulek \\[s závorkou\\]](https://example.com/x)");
  });
});

describe("buildLlmsIndex", () => {
  it("names the publication, summarises it and links the sections", async () => {
    const index = await buildLlmsIndex("cs", CONTENT_DIR);
    expect(index.startsWith("# DNESKAi\n")).toBe(true);
    expect(index).toContain("\n> Jedno vydání a máte přehled.");
    expect(index).toContain("## Rubriky");
    expect(index).toContain("## Další z magazínu");
    expect(index).toContain("## Poslední vydání");
    // llmstxt.org reserves this heading verbatim for droppable links.
    expect(index).toContain("## Optional");
    expect(index).toContain("/feed.xml");
    expect(index).toContain("/api/today.json");
  });

  it("links every edition to its markdown copy and nowhere else", async () => {
    const index = await buildLlmsIndex("cs", CONTENT_DIR);
    const editionBlock = index.split("## Poslední vydání")[1]?.split("## Optional")[0] ?? "";
    const links = [...editionBlock.matchAll(/\]\((https?:[^)]+)\)/g)].map((match) => match[1] ?? "");
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(MAX_INDEX_EDITIONS);
    for (const href of links) {
      expect(href, href).toMatch(/\/articles\/[^/]+\.md$/);
    }
  });

  it("omits withdrawn editions", async () => {
    const index = await buildLlmsIndex("cs", CONTENT_DIR);
    const held = heldArticleSlugs();
    expect(held.length).toBeGreaterThan(0);
    for (const slug of held) {
      expect(index, slug).not.toContain(articleMarkdownPath(slug));
    }
  });

  it("is byte-identical across calls", async () => {
    const first = await buildLlmsIndex("cs", CONTENT_DIR);
    const second = await buildLlmsIndex("cs", CONTENT_DIR);
    expect(first).toBe(second);
  });
});
