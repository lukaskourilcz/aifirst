import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import { persist } from "../persist.js";
import type { WrittenArticle } from "../write.js";

const article: WrittenArticle = {
  title: "Test feature",
  slug: "2026-05-12-test-feature",
  date: "2026-05-12",
  dek: "A dek.",
  tags: ["ai", "test"],
  bodyMdx: "First paragraph.\n\n## A section\n\nMore prose.",
  illustrationPrompt: "A scene.",
  illustrationAlt: "Alt text.",
  sources: [{ id: "abc", url: "https://example.com/a", title: "A" }],
};

let originalCwd: string;
let tempCwd: string;

beforeAll(async () => {
  originalCwd = process.cwd();
  tempCwd = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-persist-"));
  process.chdir(tempCwd);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(tempCwd, { recursive: true, force: true });
});

describe("persist", () => {
  it("writes a valid MDX file with the expected frontmatter shape", async () => {
    const file = await persist({
      article,
      illustrationPath: "/illustrations/2026-05-12.webp",
    });

    expect(file).toBe(
      path.join(tempCwd, "content", "articles", "2026-05-12.mdx"),
    );

    const raw = await fs.readFile(file, "utf8");
    const { data, content } = matter(raw);

    expect(data.title).toBe("Test feature");
    expect(data.slug).toBe("2026-05-12-test-feature");
    expect(data.date).toBe("2026-05-12");
    expect(data.tags).toEqual(["ai", "test"]);
    expect(data.sources).toHaveLength(1);
    expect(data.illustration).toEqual({
      path: "/illustrations/2026-05-12.webp",
      prompt: "A scene.",
      alt: "Alt text.",
    });
    expect(content.trim()).toBe(article.bodyMdx.trim());
  });
});
