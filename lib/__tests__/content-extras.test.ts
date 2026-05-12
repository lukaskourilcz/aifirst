import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  listTagsByFrequency,
  listArticlesByTag,
  relatedArticles,
  sourceCitationStats,
  buildSearchIndex,
  type ArticleSummary,
} from "../content.js";

function fixture(
  date: string,
  slug: string,
  title: string,
  tags: string[],
  sources: Array<{ id: string }>,
) {
  return `---
title: ${title}
slug: ${slug}
date: "${date}"
dek: dek for ${slug}
tags: [${tags.join(", ")}]
sources:
${sources.map((s) => `  - { id: ${s.id}, url: https://x/${s.id}, title: ${s.id} }`).join("\n")}
illustration:
  path: /x.webp
  prompt: p
  alt: a
---

Body of ${slug}.
`;
}

let dir: string;

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-extras-"));
  await fs.writeFile(
    path.join(dir, "2026-05-10.mdx"),
    fixture("2026-05-10", "a", "A", ["ai", "models"], [{ id: "anthropic-news" }, { id: "openai-blog" }]),
  );
  await fs.writeFile(
    path.join(dir, "2026-05-11.mdx"),
    fixture("2026-05-11", "b", "B", ["ai", "dev-tools"], [{ id: "anthropic-news" }, { id: "hn-frontpage" }]),
  );
  await fs.writeFile(
    path.join(dir, "2026-05-12.mdx"),
    fixture("2026-05-12", "c", "C", ["policy"], [{ id: "the-verge" }]),
  );
});

describe("listTagsByFrequency", () => {
  it("orders by frequency desc then alpha", async () => {
    const tags = await listTagsByFrequency(dir);
    expect(tags[0]?.tag).toBe("ai");
    expect(tags[0]?.count).toBe(2);
    const others = tags.slice(1).map((t) => t.tag);
    expect(new Set(others)).toEqual(new Set(["dev-tools", "models", "policy"]));
  });
});

describe("listArticlesByTag", () => {
  it("returns matching articles newest-first", async () => {
    const ai = await listArticlesByTag("ai", dir);
    expect(ai.map((a) => a.slug)).toEqual(["b", "a"]);
  });
  it("returns empty for unknown tag", async () => {
    expect(await listArticlesByTag("missing", dir)).toEqual([]);
  });
});

describe("relatedArticles", () => {
  it("ranks by tag overlap then date", () => {
    const current: ArticleSummary = {
      slug: "a",
      date: "2026-05-10",
      title: "A",
      tags: ["ai", "models"],
    };
    const all: ArticleSummary[] = [
      current,
      { slug: "b", date: "2026-05-11", title: "B", tags: ["ai", "dev-tools"] },
      { slug: "c", date: "2026-05-12", title: "C", tags: ["policy"] },
    ];
    const related = relatedArticles(current, all);
    expect(related.map((r) => r.slug)).toEqual(["b"]);
  });
});

describe("sourceCitationStats", () => {
  it("counts unique sources across issues", async () => {
    const stats = await sourceCitationStats(dir);
    expect(stats.get("anthropic-news")?.count).toBe(2);
    expect(stats.get("anthropic-news")?.latestDate).toBe("2026-05-11");
    expect(stats.get("openai-blog")?.count).toBe(1);
    expect(stats.get("the-verge")?.count).toBe(1);
  });
});

describe("buildSearchIndex", () => {
  it("returns one entry per article with searchable fields", async () => {
    const index = await buildSearchIndex(dir);
    expect(index).toHaveLength(3);
    const c = index.find((e) => e.slug === "c");
    expect(c?.tags).toEqual(["policy"]);
    expect(c?.title).toBe("C");
  });
});
