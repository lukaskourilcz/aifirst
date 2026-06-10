import { createHash } from "node:crypto";
import type { Source, ScrapedItem } from "./types.js";

export function stableId(url: string): string {
  return createHash("sha1").update(url).digest("hex").slice(0, 16);
}

// Build a ScrapedItem from a url + raw fields, applying the shared
// defaults every adapter needs: stable id, normalised title, clamped
// summary, source id, and source tags.
export function makeItem(
  url: string,
  fields: { title?: string; summary?: string; publishedAt?: string },
  source: Source,
): ScrapedItem {
  return {
    id: stableId(url),
    url,
    title: (fields.title ?? "").replace(/\s+/g, " ").trim(),
    summary: clampSummary(fields.summary),
    publishedAt: fields.publishedAt ?? new Date().toISOString(),
    source: source.id,
    tags: source.tags ?? [],
  };
}

export function clampSummary(text: string | undefined, max = 500): string {
  if (!text) return "";
  const stripped = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > max ? stripped.slice(0, max - 1) + "…" : stripped;
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`timeout after ${ms}ms`)), ms),
    ),
  ]);
}
