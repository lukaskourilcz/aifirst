import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { ArticleSummary } from "../content";
import type { Locale } from "../i18n/config";

export type Topic = {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  tags: string[];
  aliases: string[];
  featured: boolean;
  order: number;
  enabled: boolean;
};

export type TopicsConfig = {
  schemaVersion: 1;
  minimumIssues: number;
  topics: Topic[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateTopicsConfig(value: unknown): string[] {
  if (!isRecord(value)) return ["topics configuration must be an object"];
  const errors: string[] = [];
  if (value.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!Number.isInteger(value.minimumIssues) || Number(value.minimumIssues) < 1) {
    errors.push("minimumIssues must be a positive integer");
  }
  if (!Array.isArray(value.topics)) return [...errors, "topics must be an array"];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const [index, raw] of value.topics.entries()) {
    if (!isRecord(raw)) {
      errors.push(`topics[${index}] must be an object`);
      continue;
    }
    const id = String(raw.id ?? "");
    const slug = String(raw.slug ?? "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push(`topics[${index}].id is invalid`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`topics[${index}].slug is invalid`);
    if (ids.has(id)) errors.push(`duplicate topic id: ${id}`);
    if (slugs.has(slug)) errors.push(`duplicate topic slug: ${slug}`);
    ids.add(id);
    slugs.add(slug);
    if (!Array.isArray(raw.tags) || raw.tags.length === 0) errors.push(`topics[${index}].tags must not be empty`);
    for (const key of ["title", "description"] as const) {
      const localized = raw[key];
      if (!isRecord(localized) || typeof localized.en !== "string" || typeof localized.cs !== "string") {
        errors.push(`topics[${index}].${key} must contain en and cs strings`);
      }
    }
  }
  return errors;
}

export async function loadTopicsConfig(
  file = path.join(process.cwd(), "config", "topics.yml"),
): Promise<TopicsConfig> {
  const parsed = YAML.parse(await fs.readFile(file, "utf8")) as unknown;
  const errors = validateTopicsConfig(parsed);
  if (errors.length) throw new Error(`Invalid topics configuration:\n- ${errors.join("\n- ")}`);
  return parsed as TopicsConfig;
}

export function articlesForTopic(topic: Topic, articles: ArticleSummary[]): ArticleSummary[] {
  const accepted = new Set([...topic.tags, ...topic.aliases].map((tag) => tag.toLowerCase()));
  return articles.filter((article) =>
    (article.tags ?? []).some((tag) => accepted.has(tag.toLowerCase())),
  );
}

export function publishedTopics(config: TopicsConfig, articles: ArticleSummary[]) {
  return config.topics
    .filter((topic) => topic.enabled)
    .map((topic) => ({ topic, articles: articlesForTopic(topic, articles) }))
    .filter(({ articles: matches }) => matches.length >= config.minimumIssues)
    .sort((a, b) => a.topic.order - b.topic.order || a.topic.slug.localeCompare(b.topic.slug));
}

export function topicsForArticle(config: TopicsConfig, article: ArticleSummary): Topic[] {
  return config.topics.filter((topic) => topic.enabled && articlesForTopic(topic, [article]).length > 0);
}
