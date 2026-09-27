import { describe, expect, it } from "vitest";
import { mentionsPrice, practicalErrors, readPractical } from "../practical";
import { validateArticleFrontmatter } from "../editorial/validation";

const flat = (over: Record<string, unknown> = {}) => ({
  type: "tool",
  title: "NotebookLM umí shrnout PDF do audia",
  text: "Nahrajte výroční zprávu a nechte si vygenerovat desetiminutový podcast se shrnutím.",
  url: "https://notebooklm.google.com",
  verified_at: "2026-11-04",
  ...over,
});

const block = (over: Record<string, unknown> = {}) => ({
  variant: "daily",
  items: [{
    kind: "prompt",
    title: "Shrnutí schůzky do tří úkolů",
    body: "Vlož přepis schůzky a napiš: Vypiš tři konkrétní úkoly, u každého vlastníka a termín.",
    source_url: "https://example.com/meeting-prompts",
  }],
  ...over,
});

describe("practical: CONTRACTS.md §2 flat item", () => {
  it("accepts a sourced tool", () => {
    expect(practicalErrors(flat(), "2026-11-05")).toEqual([]);
    expect(readPractical(flat(), "2026-11-05")?.items[0]).toMatchObject({ type: "tool", url: "https://notebooklm.google.com", verified_at: "2026-11-04" });
  });

  it("accepts a prompt without a link or date", () => {
    const prompt = { type: "prompt", title: "Kritik vlastního textu", text: "Přečti si můj text jako skeptický editor a vypiš tři nejslabší tvrzení." };
    expect(practicalErrors(prompt, "2026-11-05")).toEqual([]);
    expect(readPractical(prompt)?.items[0]?.url).toBeUndefined();
  });

  it("rejects wrong types, lengths and missing tool urls", () => {
    expect(practicalErrors(flat({ type: "video" }))).toContain("practical.type must be prompt, tool or term");
    expect(practicalErrors(flat({ title: "x".repeat(81) }))).toContain("practical.title must be 1-80 characters");
    expect(practicalErrors(flat({ title: "x".repeat(80) }), "2026-11-05")).toEqual([]);
    expect(practicalErrors(flat({ text: "x".repeat(401) }))).toContain("practical.text must be 1-400 characters");
    expect(practicalErrors(flat({ url: undefined, verified_at: undefined }))).toContain("practical.url is required for a tool");
    expect(practicalErrors(flat({ url: "http://notebooklm.google.com" }))).toContain("practical.url must be an https URL");
  });

  it("requires verified_at with a url or a price, and never in the future", () => {
    expect(practicalErrors(flat({ verified_at: undefined }))).toContain("practical.verified_at is required when a url or a price is given");
    const priced = { type: "term", title: "Tokeny", text: "Model za milion tokenů stojí od 3 USD." };
    expect(practicalErrors(priced)).toContain("practical.verified_at is required when a url or a price is given");
    expect(practicalErrors({ ...priced, verified_at: "2026-11-01" }, "2026-11-05")).toEqual([]);
    expect(practicalErrors(flat({ verified_at: "2026-11-06" }), "2026-11-05")[0]).toMatch(/later than the edition date/);
    expect(practicalErrors(flat({ verified_at: "2026-02-30" }))).toContain("practical.verified_at must be a real YYYY-MM-DD date");
  });

  it("recognises prices in Czech copy", () => {
    expect(mentionsPrice("stojí 490 Kč měsíčně")).toBe(true);
    expect(mentionsPrice("Plus za $20")).toBe(true);
    expect(mentionsPrice("9 € za uživatele")).toBe(true);
    expect(mentionsPrice("verze 4 a 5 modelů")).toBe(false);
  });

  it("reads an invalid value as absent", () => {
    expect(readPractical(flat({ type: "video" }))).toBeNull();
    expect(readPractical(undefined)).toBeNull();
    expect(readPractical("tip")).toBeNull();
  });
});

describe("practical: BoardlessAI writer block", () => {
  it("accepts a daily block and maps it to reader items", () => {
    expect(practicalErrors(block())).toEqual([]);
    expect(readPractical(block())).toEqual({
      variant: "daily",
      items: [{
        type: "prompt",
        title: "Shrnutí schůzky do tří úkolů",
        text: "Vlož přepis schůzky a napiš: Vypiš tři konkrétní úkoly, u každého vlastníka a termín.",
        url: "https://example.com/meeting-prompts",
      }],
    });
  });

  it("holds the block to its shape", () => {
    const item = block().items[0]!;
    expect(practicalErrors(block({ items: [item, { ...item, title: "Jiný" }] }))).toContain("a daily practical block carries exactly one item");
    expect(practicalErrors(block({ variant: "friday-tools", items: [item, { ...item }] }))).toContain("two practical items share a title");
    expect(practicalErrors(block({ items: [{ ...item, body: "krátké" }] }))).toContain("practical.items[0].body must be 40-600 characters");
    expect(practicalErrors(block({ items: [] }))).toContain("practical.items must hold 1-4 items");
  });
});

describe("practical in edition validation", () => {
  const edition = (practical: unknown) => ({
    title: "Titulek",
    slug: "2026-11-05-titulek",
    date: "2026-11-05",
    dek: "Perex",
    tags: ["ai"],
    sources: [],
    illustration: { alt: "Popis" },
    ...(practical === undefined ? {} : { practical }),
  });

  it("is optional and validated when present", () => {
    expect(validateArticleFrontmatter(edition(undefined), "2026-11-05.cs.mdx")).toEqual([]);
    expect(validateArticleFrontmatter(edition(flat()), "2026-11-05.cs.mdx")).toEqual([]);
    expect(validateArticleFrontmatter(edition(flat({ verified_at: undefined })), "2026-11-05.cs.mdx")).toEqual([
      "2026-11-05.cs.mdx: practical.verified_at is required when a url or a price is given",
    ]);
  });
});
