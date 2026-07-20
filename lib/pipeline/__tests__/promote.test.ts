import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { toPromotionPost } from "../promote.js";
import {
  listPromotions,
  readPromotion,
  writePromotionFile,
} from "../../promotion-store.js";

const toolOut = {
  en: {
    title: "EN hook",
    summary: "EN summary.",
    instagram: "EN instagram caption #ai",
    threads: "EN threads caption",
  },
  cs: {
    title: "CS hook",
    summary: "CS summary.",
    instagram: "CS instagram caption #ai",
    threads: "CS threads caption",
  },
};

describe("toPromotionPost", () => {
  it("maps the tool output into a bilingual promotion post", () => {
    const post = toPromotionPost(toolOut, {
      date: "2026-07-05",
      slug: "2026-07-05-x",
      image: "/illustrations/2026-07-05.webp",
      generatedAt: "2026-07-05T06:00:00.000Z",
    });
    expect(post.date).toBe("2026-07-05");
    expect(post.slug).toBe("2026-07-05-x");
    expect(post.image).toBe("/illustrations/2026-07-05.webp");
    expect(post.byLocale.en.instagram).toBe("EN instagram caption #ai");
    expect(post.byLocale.cs.threads).toBe("CS threads caption");
    // IG and Threads copy are distinct per the platform brief.
    expect(post.byLocale.en.instagram).not.toBe(post.byLocale.en.threads);
    expect(post.generated_at).toBe("2026-07-05T06:00:00.000Z");
  });

  it("carries a null image through when the issue has no illustration", () => {
    const post = toPromotionPost(toolOut, {
      date: "2026-07-06",
      slug: "s",
      image: null,
    });
    expect(post.image).toBeNull();
  });
});

describe("promotion file roundtrip", () => {
  let originalCwd: string;
  let tempCwd: string;

  beforeAll(async () => {
    originalCwd = process.cwd();
    const raw = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-promo-"));
    tempCwd = await fs.realpath(raw);
    process.chdir(tempCwd);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempCwd, { recursive: true, force: true });
  });

  it("writes, reads back and lists promotion posts newest-first", async () => {
    const a = toPromotionPost(toolOut, {
      date: "2026-07-05",
      slug: "a",
      image: null,
    });
    const b = toPromotionPost(toolOut, {
      date: "2026-07-06",
      slug: "b",
      image: null,
    });
    await writePromotionFile(a);
    await writePromotionFile(b);

    const back = await readPromotion("2026-07-05");
    expect(back?.slug).toBe("a");

    const all = await listPromotions();
    expect(all.map((p) => p.date)).toEqual(["2026-07-06", "2026-07-05"]);
  });

  it("returns null for a missing or malformed file", async () => {
    expect(await readPromotion("1999-01-01")).toBeNull();
    await fs.writeFile(
      path.join(tempCwd, "content", "promotion", "bad.json"),
      "{ not valid json",
    );
    // listPromotions must skip the bad file, not throw.
    const all = await listPromotions();
    expect(all.every((p) => p.date !== "bad")).toBe(true);
  });
});
