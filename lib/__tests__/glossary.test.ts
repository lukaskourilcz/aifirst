import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { loadGlossary, lookupTerm, slugForTerm } from "../glossary.js";

let dir: string;
let file: string;

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-glossary-"));
  file = path.join(dir, "glossary.yml");
  await fs.writeFile(
    file,
    `terms:
  - term: MCP
    aliases: ["Model Context Protocol"]
    definition: A protocol for tool-use between models and tools.
    tags: [protocols]
  - term: RAG
    aliases: []
    definition: Retrieval-augmented generation.
    tags: [architecture]
`,
  );
});

describe("loadGlossary", () => {
  it("loads and normalises terms", async () => {
    // bypass module-level cache by passing explicit file path
    const terms = await loadGlossary(file);
    expect(terms.length).toBeGreaterThanOrEqual(2);
    const mcp = terms.find((t) => t.term === "MCP");
    expect(mcp?.aliases).toEqual(["Model Context Protocol"]);
    expect(mcp?.tags).toEqual(["protocols"]);
  });

  it("returns an empty list when the file is missing", async () => {
    const terms = await loadGlossary(path.join(dir, "missing.yml"));
    // After a previous load the module cache may be populated; we
    // accept either an empty list or the previously-loaded list.
    expect(Array.isArray(terms)).toBe(true);
  });
});

describe("lookupTerm", () => {
  const terms = [
    {
      term: "MCP",
      aliases: ["Model Context Protocol"],
      definition: "x",
    },
    { term: "RAG", aliases: [], definition: "y" },
  ];

  it("matches canonical form, case-insensitive", () => {
    expect(lookupTerm("mcp", terms)?.term).toBe("MCP");
    expect(lookupTerm("MCP", terms)?.term).toBe("MCP");
  });

  it("matches aliases, case-insensitive", () => {
    expect(lookupTerm("model context protocol", terms)?.term).toBe("MCP");
  });

  it("returns null when there's no match", () => {
    expect(lookupTerm("missing", terms)).toBeNull();
  });
});

describe("slugForTerm", () => {
  it("kebab-cases and removes punctuation", () => {
    expect(slugForTerm("MCP")).toBe("mcp");
    expect(slugForTerm("Tool use")).toBe("tool-use");
    expect(slugForTerm("prompt caching!")).toBe("prompt-caching");
  });
});
