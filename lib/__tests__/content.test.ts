import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { listArticles, getArticle, getLatestArticle } from "../content.js";

const fixtureA = `---
title: A older
slug: a-older
date: "2026-05-10"
dek: A
tags: [t]
sources: []
illustration:
  path: /a.webp
  prompt: a
  alt: a
---

Body of A.
`;

const fixtureB = `---
title: B newer
slug: b-newer
date: "2026-05-12"
dek: B
tags: [t]
sources: []
illustration:
  path: /b.webp
  prompt: b
  alt: b
---

Body of B.
`;

let dir: string;

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-content-"));
  await fs.writeFile(path.join(dir, "2026-05-10.mdx"), fixtureA);
  await fs.writeFile(path.join(dir, "2026-05-12.mdx"), fixtureB);
  await fs.writeFile(path.join(dir, "not-an-article.txt"), "ignored");
});

describe("listArticles", () => {
  it("returns articles sorted newest first", async () => {
    const list = await listArticles("en", dir);
    expect(list.map((a) => a.slug)).toEqual(["b-newer", "a-older"]);
  });

  it("ignores non-mdx files", async () => {
    const list = await listArticles("en", dir);
    expect(list).toHaveLength(2);
  });

  it("returns an empty list if the directory does not exist", async () => {
    const list = await listArticles("en", path.join(dir, "missing"));
    expect(list).toEqual([]);
  });
});

describe("getArticle", () => {
  it("finds an article by slug", async () => {
    const article = await getArticle("a-older", "en", dir);
    expect(article?.frontmatter.title).toBe("A older");
    expect(article?.mdx.trim()).toBe("Body of A.");
  });

  it("returns null for an unknown slug", async () => {
    expect(await getArticle("missing", "en", dir)).toBeNull();
  });
});

describe("getLatestArticle", () => {
  it("returns the newest article", async () => {
    const latest = await getLatestArticle("en", dir);
    expect(latest?.slug).toBe("b-newer");
  });
});
