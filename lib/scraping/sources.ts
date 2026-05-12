import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { Source } from "./types.js";

export async function loadSources(
  file: string = path.join(process.cwd(), "sources.yml"),
): Promise<Source[]> {
  const raw = await fs.readFile(file, "utf8");
  const parsed = YAML.parse(raw) as { sources: Source[] };
  return parsed.sources;
}
