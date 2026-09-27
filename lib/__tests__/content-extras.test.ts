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
    const tags = await listTagsByFrequency("cs", dir);
    expect(tags[0]?.tag).toBe("ai");
    expect(tags[0]?.count).toBe(2);
    const others = tags.slice(1).map((t) => t.tag);
    expect(new Set(others)).toEqual(new Set(["dev-tools", "models", "policy"]));
  });
});

describe("listArticlesByTag", () => {
  it("returns matching articles newest-first", async () => {
    const ai = await listArticlesByTag("ai", "cs", dir);
    expect(ai.map((a) => a.slug)).toEqual(["b", "a"]);
  });
  it("returns empty for unknown tag", async () => {
    expect(await listArticlesByTag("missing", "cs", dir)).toEqual([]);
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
    const registry = [{ id: "anthropic-news" }, { id: "openai-blog" }, { id: "the-verge" }];
    const stats = await sourceCitationStats(registry, "cs", dir);
    expect(stats.get("anthropic-news")?.count).toBe(2);
    expect(stats.get("anthropic-news")?.latestDate).toBe("2026-05-11");
    expect(stats.get("openai-blog")?.count).toBe(1);
    expect(stats.get("the-verge")?.count).toBe(1);
  });
});

describe("buildSearchIndex", () => {
  it("returns one entry per article with searchable fields", async () => {
    const index = await buildSearchIndex("cs", dir);
    expect(index).toHaveLength(3);
    const c = index.find((e) => e.slug === "c");
    expect(c?.tags).toEqual(["policy"]);
    expect(c?.title).toBe("C");
  });
});

describe("citation counts for URL-keyed editions", () => {
  // Schema-v2 editions key sources by URL and name the registry entry in
  // source_id; some carry neither and match only by host.
  const edition = (date: string, sources: string) => `---
title: E ${date}
slug: e-${date}
date: "${date}"
dek: d
tags: []
sources:
${sources}
illustration:
  alt: a
---

Body.
`;
  let v2: string;
  const registry = [
    { id: "the-verge", url: "https://www.theverge.com/rss/index.xml" },
    { id: "the-register", url: "https://www.theregister.com/headlines.atom" },
    { id: "tensorfeed", url: "https://tensorfeed.ai/feed.xml" },
    { id: "ars-technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
    { id: "wired-ai", url: "https://www.wired.com/feed/tag/ai/latest/rss" },
  ];

  beforeAll(async () => {
    v2 = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-citations-"));
    await fs.writeFile(path.join(v2, "2026-09-24.cs.mdx"), edition("2026-09-24", [
      "  - { id: 'https://www.theverge.com/?p=1', url: 'https://www.theverge.com/tech/1/x', title: a, source_id: the-verge }",
      "  - { id: 'https://www.theverge.com/?p=2', url: 'https://www.theverge.com/tech/2/y', title: b, source_id: the-verge }",
      "  - { id: 'https://arstechnica.com/a', url: 'https://arstechnica.com/security/2026/09/a/', title: c }",
    ].join("\n")));
    await fs.writeFile(path.join(v2, "2026-09-25.cs.mdx"), edition("2026-09-25", [
      "  - { id: 'https://www.theregister.com/a/1', url: 'https://www.theregister.com/2026/09/25/x', title: d, source_id: the-register }",
      "  - { id: 'https://www.wsj.com/x', url: 'https://www.wsj.com/economy/x', title: e, source_id: tensorfeed }",
      "  - { id: 'https://www.theverge.com/?p=3', url: 'https://www.theverge.com/tech/3/z', title: f, source_id: the-verge }",
    ].join("\n")));
  });

  it("counts each publication once per edition, by source_id or host", async () => {
    const stats = await sourceCitationStats(registry, "cs", v2);
    expect(stats.get("the-verge")).toEqual({ id: "the-verge", count: 2, latestDate: "2026-09-25" });
    expect(stats.get("the-register")?.count).toBe(1);
    expect(stats.get("tensorfeed")?.count).toBe(1);
    // Matched by host alone: the feed lives on feeds.arstechnica.com.
    expect(stats.get("ars-technica")?.latestDate).toBe("2026-09-24");
    expect(stats.get("wired-ai")).toBeUndefined();
  });
});
