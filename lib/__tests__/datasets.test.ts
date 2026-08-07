import { describe, it, expect } from "vitest";
import { loadAiFacts } from "../facts.js";
import { loadAiLessons } from "../lessons.js";
import type { DatasetFile } from "../daily.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Counts are minimums, not equalities: the datasets are append-only and an
// append must not require a test edit. See `data/README.md`.
const DATASETS: Array<{ name: string; file: DatasetFile; minimum: number }> = [
  { name: "ai-facts", file: loadAiFacts(), minimum: 50 },
  { name: "ai-lessons", file: loadAiLessons(), minimum: 60 },
];

describe.each(DATASETS)("$name", ({ name, file, minimum }) => {
  it("declares the dataset envelope", () => {
    expect(file.schemaVersion).toBe("boardless-dataset/1");
    expect(file.dataset).toBe(name);
    expect(file.anchor).toMatch(DATE);
  });

  it("shares the launch anchor with every other dataset", () => {
    expect(file.anchor).toBe("2026-07-01");
  });

  it("carries at least the entries it shipped with", () => {
    expect(file.entries.length).toBeGreaterThanOrEqual(minimum);
  });

  it("labels every category in both locales", () => {
    expect(Object.keys(file.categories).length).toBeGreaterThan(0);
    for (const [key, label] of Object.entries(file.categories)) {
      expect(key, `category key ${key}`).toMatch(SLUG);
      expect(label.en.trim(), `${key}.en`).not.toBe("");
      expect(label.cs.trim(), `${key}.cs`).not.toBe("");
    }
  });

  it("gives every entry a unique id and slug", () => {
    const ids = file.entries.map((entry) => entry.id);
    const slugs = file.entries.map((entry) => entry.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("holds every required field on every entry", () => {
    for (const entry of file.entries) {
      expect(entry.id.trim(), `${entry.id}.id`).not.toBe("");
      expect(entry.slug, `${entry.id}.slug`).toMatch(SLUG);
      expect(entry.verified, `${entry.id}.verified`).toMatch(DATE);
      expect(entry.source.trim(), `${entry.id}.source`).not.toBe("");
    }
  });

  it("points every entry at a category the file declares", () => {
    for (const entry of file.entries) {
      expect(Object.keys(file.categories), `${entry.id}.category`).toContain(entry.category);
    }
  });

  it("carries non-empty English and Czech text on every entry", () => {
    for (const entry of file.entries) {
      for (const locale of ["en", "cs"] as const) {
        expect(entry[locale].short.trim(), `${entry.id}.${locale}.short`).not.toBe("");
        expect(entry[locale].full.trim(), `${entry.id}.${locale}.full`).not.toBe("");
      }
    }
  });

  it("keeps every short line to one line", () => {
    for (const entry of file.entries) {
      for (const locale of ["en", "cs"] as const) {
        expect(entry[locale].short, `${entry.id}.${locale}.short`).not.toContain("\n");
      }
    }
  });
});

describe("ai-lessons", () => {
  const lessons = loadAiLessons();

  it("names a term on every entry", () => {
    for (const entry of lessons.entries) {
      expect(entry.term?.trim(), `${entry.id}.term`).toBeTruthy();
    }
  });

  it("carries no promotion field — that belongs to the MMA facts", () => {
    for (const entry of lessons.entries) {
      expect(entry.promotion, `${entry.id}.promotion`).toBeUndefined();
    }
  });
});

describe("ai-facts", () => {
  const facts = loadAiFacts();

  it("carries no term field — that belongs to the lessons", () => {
    for (const entry of facts.entries) {
      expect(entry.term, `${entry.id}.term`).toBeUndefined();
    }
  });
});
