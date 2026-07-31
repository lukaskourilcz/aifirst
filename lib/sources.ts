import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export type SourceType =
  | "rss"
  | "html"
  | "hn"
  | "arxiv"
  | "bluesky"
  | "spaceflight"
  | "github"
  | "stackexchange"
  | "guardian"
  | "nytimes"
  | "gnews";

export type Source = {
  id: string;
  type: SourceType;
  name: string;
  weight?: number;
  tags?: string[];
  url?: string;
  query?: string;
  repos?: string[];
  section?: string;
  site?: string;
};

/** Read-only citation registry. Collection is owned by BoardlessAI. */
export async function loadSources(
  file: string = path.join(process.cwd(), "sources.yml"),
): Promise<Source[]> {
  const raw = await fs.readFile(file, "utf8");
  const parsed = YAML.parse(raw) as { sources?: unknown };
  if (!Array.isArray(parsed.sources)) throw new Error("sources.yml must contain a sources array");
  return parsed.sources as Source[];
}
