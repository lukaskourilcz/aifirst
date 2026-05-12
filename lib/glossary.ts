import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export type GlossaryTerm = {
  term: string;
  aliases: string[];
  definition: string;
  first_seen?: string;
  tags?: string[];
};

let cache: GlossaryTerm[] | null = null;

export async function loadGlossary(
  file: string = path.join(process.cwd(), "glossary.yml"),
): Promise<GlossaryTerm[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = YAML.parse(raw) as { terms: GlossaryTerm[] };
    cache = (parsed.terms ?? []).map((t) => ({
      term: t.term,
      aliases: t.aliases ?? [],
      definition: t.definition,
      first_seen: t.first_seen,
      tags: t.tags ?? [],
    }));
    return cache;
  } catch {
    cache = [];
    return cache;
  }
}

export function lookupTerm(
  needle: string,
  terms: GlossaryTerm[],
): GlossaryTerm | null {
  const n = needle.trim().toLowerCase();
  for (const t of terms) {
    if (t.term.toLowerCase() === n) return t;
    if (t.aliases.some((a) => a.toLowerCase() === n)) return t;
  }
  return null;
}

export function slugForTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
