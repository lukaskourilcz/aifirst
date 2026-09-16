import { describe, expect, it } from "vitest";
import { practicalErrors, translationStructureErrors, validateArticleFrontmatter } from "../validation";
import type { ArticleFrontmatter } from "../../content";

const legacy: Record<string, unknown> = {
  title: "Legacy",
  slug: "2026-01-01-legacy",
  date: "2026-01-01",
  dek: "A dek.",
  tags: ["ai"],
  sources: [{ id: "one", title: "Source", url: "https://example.com" }],
  illustration: { prompt: "Prompt", alt: "Alt" },
};

const modern: Record<string, unknown> = {
  ...legacy,
  schema_version: 2,
  why_it_matters: ["Who is affected.", "What to watch."],
  what_changed: ["A practical change."],
  uncertainty: ["One open question."],
  generation: {
    generated_at: "2026-01-01T06:00:00Z",
    human_reviewed: false,
    models: { curation: "model", writing: "model" },
    cost: { amount: 0.1, currency: "USD" },
  },
};

describe("article validation", () => {
  it("keeps valid legacy content compatible", () => {
    expect(validateArticleFrontmatter(legacy, "2026-01-01.mdx")).toEqual([]);
  });

  it("accepts the new daily editorial contract", () => {
    expect(validateArticleFrontmatter(modern, "2026-01-01.en.mdx")).toEqual([]);
  });

  it("requires new editorial fields only for schema v2", () => {
    const errors = validateArticleFrontmatter({ ...modern, why_it_matters: undefined }, "2026-01-01.en.mdx");
    expect(errors.some((error) => error.includes("why_it_matters"))).toBe(true);
  });

  it("rejects impossible correction dates", () => {
    const errors = validateArticleFrontmatter({ ...legacy, corrections: [{ date: "2026-02-30", description: "Fix" }] }, "2026-01-01.mdx");
    expect(errors.some((error) => error.includes("corrections[0]"))).toBe(true);
  });

  it("rejects invalid source URLs and duplicate references", () => {
    const errors = validateArticleFrontmatter({ ...legacy, sources: [{ id: "x", title: "X", url: "javascript:bad" }, { id: "y", title: "Y", url: "javascript:bad" }] }, "2026-01-01.mdx");
    expect(errors.some((error) => error.includes("http(s) URL"))).toBe(true);
    expect(errors.some((error) => error.includes("duplicate source URL"))).toBe(true);
  });

  it("requires sponsor alt text when an image is present", () => {
    const errors = validateArticleFrontmatter({ ...legacy, sponsor: { name: "S", url: "https://example.com", label: "Supported by", copy: "Copy", image: "/s.webp" } }, "2026-01-01.mdx");
    expect(errors.some((error) => error.includes("image_alt"))).toBe(true);
  });

  it("rejects third-party sponsor image URLs", () => {
    const errors = validateArticleFrontmatter({ ...legacy, sponsor: { name: "S", url: "https://example.com", label: "Supported by", copy: "Copy", image: "https://tracker.example/pixel.gif", image_alt: "Sponsor" } }, "2026-01-01.mdx");
    expect(errors.some((error) => error.includes("local root-relative"))).toBe(true);
  });

  it("validates weekly date ranges", () => {
    const errors = validateArticleFrontmatter({ ...legacy, type: "weekly", digest: { from: "2026-01-08", to: "2026-01-01", covered_slugs: ["one"] } }, "2026-01-01-weekly.mdx");
    expect(errors.some((error) => error.includes("digest range"))).toBe(true);
  });

  it("detects translated source-link drift", () => {
    const en = legacy as unknown as ArticleFrontmatter;
    const cs = { ...legacy, sources: [{ id: "two", title: "Jiný", url: "https://other.example" }] } as unknown as ArticleFrontmatter;
    expect(translationStructureErrors([{ file: "en", fm: en }, { file: "cs", fm: cs }]).some((error) => error.includes("source URLs drift"))).toBe(true);
  });

  it("detects translated topic, signal and linkage drift", () => {
    const en = { ...modern, translation_of: legacy.slug, signal_strength: 70 } as unknown as ArticleFrontmatter;
    const cs = { ...modern, translation_of: "wrong", tags: ["other"], signal_strength: 71 } as unknown as ArticleFrontmatter;
    const errors = translationStructureErrors([{ file: "en", fm: en }, { file: "cs", fm: cs }]);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining("topic/tag linkage drifts"),
      expect.stringContaining("signal strength drifts"),
      expect.stringContaining("translation_of"),
    ]));
  });
});

describe("the practical block in committed content", () => {
  const cited = "https://example.com";
  const wired = "https://example.com/wire";
  const base: Record<string, unknown> = { ...legacy, wire: [{ title: "W", url: wired, source: "Example" }] };
  const item = (overrides: Record<string, unknown> = {}) => ({
    kind: "tool",
    title: "Nástroj",
    body: "Forty characters of body copy is the upstream minimum, so this one clears it.",
    source_url: cited,
    ...overrides,
  });
  const errorsFor = (practical: unknown) => practicalErrors({ ...base, practical }, "2026-01-01.cs.mdx");

  it("says nothing when the block is absent, which is every edition so far", () => {
    expect(practicalErrors(base, "2026-01-01.cs.mdx")).toEqual([]);
  });

  it("accepts a grounded block, including one that cites a wire item", () => {
    expect(errorsFor({ variant: "daily", items: [item()] })).toEqual([]);
    expect(errorsFor({ variant: "friday-tools", items: [item({ source_url: wired })] })).toEqual([]);
  });

  it("rejects a non-object block and an item list the reader cannot render whole", () => {
    expect(errorsFor("nope").join()).toContain("practical must be an object");
    expect(errorsFor({ variant: "daily", items: [] }).join()).toContain("must hold 1-4 items");
    expect(errorsFor({ variant: "daily", items: [item(), item(), item(), item(), item()] }).join()).toContain("must hold 1-4 items");
  });

  it("rejects an unknown variant and an unknown kind", () => {
    expect(errorsFor({ variant: "monday-hacks", items: [item()] }).join()).toContain("practical.variant must be one of");
    expect(errorsFor({ variant: "daily", items: [item({ kind: "webinar" })] }).join()).toContain("kind must be one of");
  });

  it("rejects a missing key, a non-object item and a downgraded URL", () => {
    expect(errorsFor({ variant: "daily", items: [item({ title: undefined })] }).join()).toContain("title is required");
    expect(errorsFor({ variant: "daily", items: ["a string"] }).join()).toContain("must be an object");
    expect(errorsFor({ variant: "daily", items: [item({ source_url: "http://example.com" })] }).join()).toContain("must be an https URL");
  });

  it("rejects two items a reader cannot tell apart", () => {
    expect(errorsFor({ variant: "daily", items: [item(), item({ title: " nástroj " })] }).join()).toContain("duplicates an earlier practical item");
  });

  it("rejects a URL spelled out in the title or the body", () => {
    expect(errorsFor({ variant: "daily", items: [item({ title: "Viz https://example.com" })] }).join()).toContain("title must not contain a URL");
    expect(errorsFor({ variant: "daily", items: [item({ body: "Otevřete http://example.com a zkuste to sami." })] }).join()).toContain("body must not contain a URL");
  });

  it("rejects a source_url this file never cited", () => {
    expect(errorsFor({ variant: "daily", items: [item({ source_url: "https://example.com/never-cited" })] }).join()).toContain("is not cited in this file's sources or wire");
  });

  it("lets a Czech-only block stand: the block is not compared across locales", () => {
    // A practical item is written for one language's readers. Requiring both
    // halves to carry the same one would fail a legitimately Czech-only block.
    const en = legacy as unknown as ArticleFrontmatter;
    const cs = { ...legacy, practical: { variant: "daily", items: [item()] } } as unknown as ArticleFrontmatter;
    expect(translationStructureErrors([{ file: "en", fm: en }, { file: "cs", fm: cs }])).toEqual([]);
  });
});
