import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { coverageFor } from "../weekly.js";

function makeArticle(date: string, slug: string, type?: "daily" | "weekly") {
  return `---
title: ${slug}
slug: ${slug}
date: "${date}"
${type ? `type: ${type}\n` : ""}dek: dek
tags: [t]
sources: []
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
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-weekly-"));
  await fs.writeFile(
    path.join(dir, "2026-05-10.mdx"),
    makeArticle("2026-05-10", "a"),
  );
  await fs.writeFile(
    path.join(dir, "2026-05-11.mdx"),
    makeArticle("2026-05-11", "b"),
  );
  await fs.writeFile(
    path.join(dir, "2026-05-12.mdx"),
    makeArticle("2026-05-12", "c"),
  );
  // An older daily outside the 7-day window
  await fs.writeFile(
    path.join(dir, "2026-04-30.mdx"),
    makeArticle("2026-04-30", "old"),
  );
  // A previous weekly digest — must be excluded
  await fs.writeFile(
    path.join(dir, "2026-05-10-weekly.mdx"),
    makeArticle("2026-05-10", "weekly-old", "weekly"),
  );
});

describe("coverageFor", () => {
  it("returns daily articles within the 7-day window ending on the given date", async () => {
    const covered = await coverageFor("2026-05-17", dir);
    expect(covered.map((a) => a.slug).sort()).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("excludes weekly digests from the coverage set", async () => {
    const covered = await coverageFor("2026-05-17", dir);
    expect(covered.some((a) => a.slug === "weekly-old")).toBe(false);
  });

  it("excludes dailies outside the window", async () => {
    const covered = await coverageFor("2026-05-17", dir);
    expect(covered.some((a) => a.slug === "old")).toBe(false);
  });
});
