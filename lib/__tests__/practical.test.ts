import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { getArticle, resolvePractical } from "../content.js";

// The practical block reaches the reader as YAML in an article's frontmatter and
// nothing validates it on the way in, so these fixtures are written by hand and
// read back through `getArticle` — the same path a page takes.
function fixture(slug: string, practical: string) {
  return `---
title: ${slug.toUpperCase()}
slug: ${slug}
date: "2026-09-11"
dek: dek for ${slug}
tags: [ai]
sources:
  - { id: anthropic-news, url: "https://example.test/tool-a", title: A }
wire:
  - { title: W, url: "https://example.test/wire", source: Example }
illustration:
  alt: a
${practical}---

Body of ${slug}.
`;
}

const ITEM = (kind: string, title: string, url: string) =>
  `  - kind: ${kind}
    title: "${title}"
    body: "Forty characters of body copy is the upstream minimum, so this one clears it."
    source_url: "${url}"`;

function block(variant: string, items: string[]) {
  return `practical:
  variant: ${variant}
  items:
${items.join("\n")}
`;
}

let dir: string;

async function practicalFor(slug: string) {
  const article = await getArticle(slug, "cs", dir);
  expect(article, `${slug} fixture missing`).not.toBe(null);
  return resolvePractical(article!.frontmatter);
}

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-practical-"));
  const write = (slug: string, practical: string) =>
    fs.writeFile(path.join(dir, `2026-09-11-${slug}.mdx`), fixture(slug, practical));

  await write("absent", "");
  await write("daily", block("daily", [ITEM("prompt", "Jeden prompt", "https://example.test/tool-a")]));
  await write(
    "friday",
    block("friday-tools", [
      ITEM("tool", "Nástroj jeden", "https://example.test/tool-a"),
      ITEM("tool", "Nástroj dva", "https://example.test/tool-b"),
      ITEM("tool", "Nástroj tři", "https://example.test/tool-c"),
      ITEM("prompt", "Prompt k tomu", "https://example.test/tool-d"),
    ]),
  );
  await write(
    "unknown-kind",
    block("daily", [
      ITEM("webinar", "Neznámý druh", "https://example.test/tool-a"),
      ITEM("tool", "Platný nástroj", "https://example.test/tool-b"),
    ]),
  );
  await write(
    "insecure-url",
    block("daily", [
      ITEM("tool", "Nezabezpečený odkaz", "http://example.test/tool-a"),
      ITEM("tool", "Platný nástroj", "https://example.test/tool-b"),
    ]),
  );
  await write(
    "non-object-item",
    block("daily", ["  - just a string", ITEM("tool", "Platný nástroj", "https://example.test/tool-b")]),
  );
  await write("all-dropped", block("daily", [ITEM("tool", "Jen http", "http://example.test/tool-a")]));
  await write("empty-items", "practical:\n  variant: daily\n  items: []\n");
  await write(
    "overflowing",
    block("friday-tools", [
      ITEM("tool", "Jeden", "https://example.test/1"),
      ITEM("tool", "Dva", "https://example.test/2"),
      ITEM("tool", "Tři", "https://example.test/3"),
      ITEM("prompt", "Čtyři", "https://example.test/4"),
      ITEM("howto", "Pět", "https://example.test/5"),
    ]),
  );
  await write("odd-variant", block("monday-hacks", [ITEM("howto", "Jak na to", "https://example.test/tool-a")]));
  await write("scalar-block", "practical: nope\n");
});

describe("resolvePractical", () => {
  it("returns null when the field is absent, which is every edition so far", async () => {
    expect(await practicalFor("absent")).toBe(null);
  });

  it("reads a well-formed daily block", async () => {
    const practical = await practicalFor("daily");
    expect(practical?.variant).toBe("daily");
    expect(practical?.items).toHaveLength(1);
    expect(practical?.items[0]).toMatchObject({
      kind: "prompt",
      title: "Jeden prompt",
      source_url: "https://example.test/tool-a",
    });
    expect(practical?.items[0]?.body.length).toBeGreaterThan(39);
  });

  it("reads a well-formed friday-tools block as three tools and a prompt", async () => {
    const practical = await practicalFor("friday");
    expect(practical?.variant).toBe("friday-tools");
    expect(practical?.items.map((item) => item.kind)).toEqual(["tool", "tool", "tool", "prompt"]);
  });

  it("drops an item whose kind it does not know", async () => {
    const practical = await practicalFor("unknown-kind");
    expect(practical?.items.map((item) => item.title)).toEqual(["Platný nástroj"]);
  });

  it("drops an item whose source_url is not https", async () => {
    const practical = await practicalFor("insecure-url");
    expect(practical?.items.map((item) => item.title)).toEqual(["Platný nástroj"]);
  });

  it("drops an item that is not an object", async () => {
    const practical = await practicalFor("non-object-item");
    expect(practical?.items.map((item) => item.title)).toEqual(["Platný nástroj"]);
  });

  it("returns null when nothing survives the filter", async () => {
    expect(await practicalFor("all-dropped")).toBe(null);
  });

  it("returns null for an empty item list and for a non-object block", async () => {
    expect(await practicalFor("empty-items")).toBe(null);
    expect(await practicalFor("scalar-block")).toBe(null);
  });

  it("truncates to four items", async () => {
    const practical = await practicalFor("overflowing");
    expect(practical?.items).toHaveLength(4);
    expect(practical?.items.map((item) => item.title)).toEqual(["Jeden", "Dva", "Tři", "Čtyři"]);
  });

  it("falls back to the daily variant rather than rendering an unlabelled section", async () => {
    const practical = await practicalFor("odd-variant");
    expect(practical?.variant).toBe("daily");
    expect(practical?.items).toHaveLength(1);
  });
});
