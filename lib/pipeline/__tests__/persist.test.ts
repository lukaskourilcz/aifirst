import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import { persist } from "../persist.js";
import type { WrittenArticle } from "../write.js";

const dispatches = [
  { title: "Note one", body: "Short prose for the first dispatch.", source_url: "https://x.test/1" },
  { title: "Note two", body: "Short prose for the second dispatch." },
];

const article: WrittenArticle = {
  slug: "2026-05-12-test-feature",
  date: "2026-05-12",
  tags: ["ai", "test"],
  illustrationPrompt: "A scene.",
  sources: [{ id: "abc", url: "https://example.com/a", title: "A" }],
  wire: [
    { title: "Runner one", url: "https://x.test/r1", source: "the-verge" },
    { title: "Runner two", url: "https://x.test/r2", source: "hf-blog" },
  ],
  byLocale: {
    cs: {
      title: "Testovací článek",
      dek: "Perex.",
      bodyMdx: "První odstavec.\n\n## Sekce\n\nDalší text.",
      illustrationAlt: "Popisek.",
      dispatches,
    },
    en: {
      title: "Test feature",
      dek: "A dek.",
      bodyMdx: "First paragraph.\n\n## A section\n\nMore prose.",
      illustrationAlt: "Alt text.",
      dispatches,
    },
  },
};

let originalCwd: string;
let tempCwd: string;

beforeAll(async () => {
  originalCwd = process.cwd();
  const raw = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-persist-"));
  tempCwd = await fs.realpath(raw);
  process.chdir(tempCwd);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(tempCwd, { recursive: true, force: true });
});

describe("persist", () => {
  it("writes one MDX file per locale with the expected frontmatter", async () => {
    const files = await persist({
      article,
      illustrationPath: "/illustrations/2026-05-12.webp",
    });

    expect(files.sort()).toEqual([
      path.join(tempCwd, "content", "articles", "2026-05-12.cs.mdx"),
      path.join(tempCwd, "content", "articles", "2026-05-12.en.mdx"),
    ]);

    const csPath = files.find((f) => f.endsWith(".cs.mdx"))!;
    const csRaw = await fs.readFile(csPath, "utf8");
    const cs = matter(csRaw);
    expect(cs.data.lang).toBe("cs");
    expect(cs.data.title).toBe("Testovací článek");
    expect(cs.data.slug).toBe("2026-05-12-test-feature");
    expect(cs.data.illustration.alt).toBe("Popisek.");
    expect(typeof cs.data.signal_strength).toBe("number");
    expect(cs.content.trim()).toBe(article.byLocale.cs.bodyMdx.trim());

    const enRaw = await fs.readFile(files[1]!, "utf8");
    const en = matter(enRaw);
    expect(en.data.lang).toBe("en");
    expect(en.data.title).toBe("Test feature");
    expect(en.data.slug).toBe("2026-05-12-test-feature");
    expect(en.content.trim()).toBe(article.byLocale.en.bodyMdx.trim());
  });
});
