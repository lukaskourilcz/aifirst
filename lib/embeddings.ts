import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { ArticleSummary } from "./content";
import type { Locale } from "./i18n/config";

// Semantic "related issues": article embeddings computed in the daily pipeline
// (scripts/embed-articles.ts, via Jina) and committed to
// public/data/embeddings.<locale>.json, read here synchronously at build. This
// is strictly a build-time enhancement — no API key or vectors ever reach the
// browser, and callers fall back to tag-overlap when no embeddings exist, so
// the feature is entirely optional.
export type EmbeddingStore = Record<string, number[]>;

const cache = new Map<string, EmbeddingStore | null>();

export function loadEmbeddings(locale: Locale): EmbeddingStore | null {
  const key = String(locale);
  if (cache.has(key)) return cache.get(key) ?? null;
  const file = path.join(
    process.cwd(),
    "public",
    "data",
    `embeddings.${key}.json`,
  );
  if (!existsSync(file)) {
    cache.set(key, null);
    return null;
  }
  try {
    const store = JSON.parse(readFileSync(file, "utf8")) as EmbeddingStore;
    cache.set(key, store);
    return store;
  } catch {
    cache.set(key, null);
    return null;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Rank `all` by embedding similarity to `current`. Returns null (not []) when
// semantic ranking can't run — no store, current not embedded, or nothing
// clears the relevance floor — so the caller can fall back to tag overlap.
export function relatedBySimilarity(
  current: ArticleSummary,
  all: ArticleSummary[],
  locale: Locale,
  limit = 3,
  minScore = 0.2,
): ArticleSummary[] | null {
  const store = loadEmbeddings(locale);
  if (!store) return null;
  const currentVec = store[current.slug];
  if (!currentVec) return null;

  const ranked = all
    .filter((a) => a.slug !== current.slug)
    .map((a) => {
      const vec = store[a.slug];
      return { a, score: vec ? cosineSimilarity(currentVec, vec) : 0 };
    })
    .filter((x) => x.score >= minScore)
    .sort((x, y) => y.score - x.score || (x.a.date < y.a.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.a);

  return ranked.length > 0 ? ranked : null;
}
