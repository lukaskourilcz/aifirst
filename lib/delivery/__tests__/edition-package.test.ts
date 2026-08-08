import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { afterEach, describe, expect, it } from "vitest";
import validFixture from "../../../contracts/fixtures/edition-package.valid.json";
import poisonFixture from "../../../contracts/fixtures/edition-package.poison.json";
import { DeliveryError, editionPackageHash, materializeEditionPackage, parseEditionPackage, validateDeliveryPackage } from "../edition-package";
import { quoteYamlDates } from "../mdx";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true }))));

async function tempRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-delivery-"));
  roots.push(root);
  return root;
}

function deliveryFixture(): Record<string, any> {
  const value = structuredClone(validFixture) as Record<string, any>;
  const svg = (width: number, height: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#111"/></svg>`;
  value.image.hero_bytes_base64 = Buffer.from(svg(1600, 900)).toString("base64");
  value.image.thumb_bytes_base64 = Buffer.from(svg(640, 360)).toString("base64");
  value.article.en.frontmatter.why_it_matters.push("Production limits still decide the realized saving.");
  value.article.cs.frontmatter.why_it_matters.push("Skutečnou úsporu stále určují produkční limity.");
  value.futureConsumerField = { accepted: true };
  const hash = editionPackageHash(value);
  value.idempotencyKey = hash;
  value.article.en.frontmatter.generation.package_hash = hash;
  value.article.cs.frontmatter.generation.package_hash = hash;
  return value;
}

describe("edition package consumer", () => {
  it("preserves date and date-time frontmatter scalars as strings", () => {
    expect(quoteYamlDates("date: 2026-08-04\ngenerated_at: 2026-08-04T03:55:00.000Z")).toBe(
      'date: "2026-08-04"\ngenerated_at: "2026-08-04T03:55:00.000Z"',
    );
  });
  it("accepts the current major and additive unknown fields", () => {
    expect(validateDeliveryPackage(deliveryFixture()).schemaVersion).toBe("edition-package/1");
  });

  it("accepts an edition when BoardlessAI has social production switched off", () => {
    const value = deliveryFixture();
    delete value.socialPackRef;
    const hash = editionPackageHash(value);
    value.idempotencyKey = hash;
    value.article.en.frontmatter.generation.package_hash = hash;
    value.article.cs.frontmatter.generation.package_hash = hash;
    expect(validateDeliveryPackage(value).status).toBe("edition");
  });

  it("accepts a generated illustration, which is neither a photograph nor the FRAME plate", async () => {
    // BoardlessAI renders one when no licensed photograph fits, gates it, and labels it as an
    // illustration in the alt text a reader hears. This side has to let the value through, and
    // still has to check that the bytes are what the origin claims.
    const sharp = (await import("sharp")).default;
    const value = deliveryFixture();
    value.image.origin = "illustration";
    value.image.license = {
      name: "BoardlessAI illustration",
      author: "BoardlessAI FRAME",
      source_url: "https://boardless-ai.vercel.app/",
      attribution_html: "Ilustrace: BoardlessAI FRAME",
    };
    value.image.alt_cs = "Ilustrace k tématu: přístrojová geometrie. Nejde o fotografii.";
    value.image.alt_en = "An illustration of instrument-panel geometry. Not a photograph.";
    value.image.hero_bytes_base64 = (await sharp({ create: { width: 1600, height: 900, channels: 3, background: { r: 10, g: 12, b: 20 } } }).webp().toBuffer()).toString("base64");
    value.image.thumb_bytes_base64 = (await sharp({ create: { width: 640, height: 360, channels: 3, background: { r: 10, g: 12, b: 20 } } }).webp().toBuffer()).toString("base64");
    for (const locale of ["en", "cs"] as const) {
      value.article[locale].frontmatter.illustration.origin = "illustration";
      value.article[locale].frontmatter.illustration.alt = locale === "en" ? value.image.alt_en : value.image.alt_cs;
    }
    const hash = editionPackageHash(value);
    value.idempotencyKey = hash;
    value.article.en.frontmatter.generation.package_hash = hash;
    value.article.cs.frontmatter.generation.package_hash = hash;

    expect(validateDeliveryPackage(value).image?.origin).toBe("illustration");
    await expect(materializeEditionPackage(value, await tempRoot())).resolves.toMatchObject({ status: "written" });
  });

  it("rejects the wrong-major poison fixture before writing", () => {
    expect(() => parseEditionPackage(poisonFixture)).toThrowError(DeliveryError);
    try { parseEditionPackage(poisonFixture); } catch (error) { expect((error as DeliveryError).code).toBe("schema_invalid"); }
  });

  it("rejects a valid-looking package whose hash was changed", () => {
    const value = deliveryFixture();
    value.reason = "tampered after signing";
    expect(() => validateDeliveryPackage(value)).toThrowError(/canonical package hash/);
  });

  it("writes only authorized paths and treats an equal replay as success", async () => {
    const root = await tempRoot();
    const pkg = deliveryFixture();
    const first = await materializeEditionPackage(pkg, root);
    expect(first.status).toBe("written");
    expect(first.paths.sort()).toEqual([
      "content/articles/2026-08-04.cs.mdx",
      "content/articles/2026-08-04.en.mdx",
      "public/data/board/2026-08-04.json",
      "public/images/editions/2026-08-04-measured-model-price-cut/hero.svg",
      "public/images/editions/2026-08-04-measured-model-price-cut/thumb.svg",
    ]);
    expect((await materializeEditionPackage(pkg, root)).status).toBe("noop");
    const board = JSON.parse(await fs.readFile(path.join(root, "public/data/board/2026-08-04.json"), "utf8"));
    expect(board).toEqual(expect.objectContaining({ status: "edition", generationCostUsd: 0.21, packageHash: pkg.idempotencyKey }));
    expect(JSON.stringify(board)).not.toContain("socialPackRef");
    const delivered = matter(await fs.readFile(path.join(root, "content/articles/2026-08-04.en.mdx"), "utf8"));
    expect(delivered.data.date).toBe("2026-08-04");
    expect(typeof delivered.data.generation.generated_at).toBe("string");
    expect(delivered.data.generation.package_hash).toBe(pkg.idempotencyKey);
  });

  it("fails closed on a same-date different package", async () => {
    const root = await tempRoot();
    const first = deliveryFixture();
    await materializeEditionPackage(first, root);
    const second = deliveryFixture();
    second.reason = "different decision";
    const hash = editionPackageHash(second);
    second.idempotencyKey = hash;
    second.article.en.frontmatter.generation.package_hash = hash;
    second.article.cs.frontmatter.generation.package_hash = hash;
    await expect(materializeEditionPackage(second, root)).rejects.toMatchObject({ code: "hash_conflict" });
  });

  it("upgrades a provisional same-day no-edition board to the first real edition", async () => {
    const root = await tempRoot();
    const provisional: Record<string, any> = {
      schemaVersion: "edition-package/1",
      date: "2026-08-04",
      idempotencyKey: "0".repeat(64),
      status: "no_edition",
      board: {
        meetingRef: "meetings/2026-08-04-cu-edition",
        roomUrl: "https://boardless.example/meetings/2026-08-04-cu-edition",
        noEditionReason: "content_invalid_after_regeneration",
      },
      generation: { models: { curation: "claude-sonnet-4-6" }, costUsd: 0.03 },
      reason: "cu-edition decision meetings/2026-08-04-cu-edition",
    };
    provisional.idempotencyKey = editionPackageHash(provisional);
    await materializeEditionPackage(provisional, root);

    const result = await materializeEditionPackage(deliveryFixture(), root);
    expect(result.status).toBe("written");
    const board = JSON.parse(await fs.readFile(
      path.join(root, "public/data/board/2026-08-04.json"),
      "utf8"
    ));
    expect(board).toMatchObject({ status: "edition" });
    await expect(fs.stat(path.join(root, "content/articles/2026-08-04.en.mdx"))).resolves.toBeDefined();
  });

  it("fails closed when any replayed sibling is missing or changed", async () => {
    const pkg = deliveryFixture();
    const mutations = [
      async (root: string) => fs.appendFile(path.join(root, "content/articles/2026-08-04.cs.mdx"), "\nchanged\n"),
      async (root: string) => fs.appendFile(path.join(root, "public/data/board/2026-08-04.json"), "\n"),
      async (root: string) => fs.appendFile(path.join(root, "public/images/editions/2026-08-04-measured-model-price-cut/hero.svg"), Buffer.from([0])),
      async (root: string) => fs.rm(path.join(root, "content/articles/2026-08-04.cs.mdx")),
    ];
    for (const mutate of mutations) {
      const root = await tempRoot();
      await materializeEditionPackage(pkg, root);
      await mutate(root);
      await expect(materializeEditionPackage(pkg, root)).rejects.toMatchObject({ code: "hash_conflict" });
    }
  });

  it("materializes NO_EDITION as board data without article files", async () => {
    const root = await tempRoot();
    const pkg: Record<string, any> = {
      schemaVersion: "edition-package/1",
      date: "2026-08-05",
      idempotencyKey: "0".repeat(64),
      status: "no_edition",
      board: { meetingRef: "meetings/2026-08-05-cu-edition", roomUrl: "https://boardless.example/meetings/2026-08-05-cu-edition", noEditionReason: "No candidate cleared the evidence threshold." },
      generation: { models: { curation: "claude-sonnet-4-6" }, costUsd: 0.03 },
      reason: "cu-edition decision meetings/2026-08-05-cu-edition",
    };
    pkg.idempotencyKey = editionPackageHash(pkg);
    const result = await materializeEditionPackage(pkg, root);
    expect(result.paths).toEqual(["public/data/board/2026-08-05.json"]);
    await expect(fs.stat(path.join(root, "content/articles/2026-08-05.en.mdx"))).rejects.toMatchObject({ code: "ENOENT" });
  });
});

describe("a Czech-only edition", () => {
  // Both magazines are moving to Czech only. The consumer has to accept a package with no
  // English half before the orchestrator ever sends one, because delivery fails closed and
  // reverts: a consumer one step behind rejects a package that is perfectly good.
  function czechOnlyFixture(): Record<string, any> {
    const value = deliveryFixture();
    delete value.article.en;
    delete value.image.alt_en;
    const hash = editionPackageHash(value);
    value.idempotencyKey = hash;
    value.article.cs.frontmatter.generation.package_hash = hash;
    return value;
  }

  it("is accepted and writes only the Czech article", async () => {
    const root = await tempRoot();
    const value = czechOnlyFixture();
    const result = await materializeEditionPackage(value, root);
    expect(result.status).toBe("written");
    const written = result.paths.map((file) => file.split(path.sep).join("/")).sort();
    expect(written).toEqual([
      `content/articles/${value.date}.cs.mdx`,
      `public/data/board/${value.date}.json`,
      value.image.hero_path,
      value.image.thumb_path,
    ].sort());
    expect(written.some((file) => file.endsWith(".en.mdx")), "no empty English file").toBe(false);
    const body = await fs.readFile(path.join(root, "content", "articles", `${value.date}.cs.mdx`), "utf8");
    expect(matter(body).data.lang).toBe("cs");
  });

  it("is still rejected when Czech is the half that is missing", () => {
    const value = deliveryFixture();
    delete value.article.cs;
    const hash = editionPackageHash(value);
    value.idempotencyKey = hash;
    value.article.en.frontmatter.generation.package_hash = hash;
    expect(() => validateDeliveryPackage(value)).toThrow(DeliveryError);
  });

  it("still requires English image text when an English article is present", () => {
    const value = deliveryFixture();
    delete value.image.alt_en;
    const hash = editionPackageHash(value);
    value.idempotencyKey = hash;
    value.article.en.frontmatter.generation.package_hash = hash;
    value.article.cs.frontmatter.generation.package_hash = hash;
    expect(() => validateDeliveryPackage(value)).toThrow(/alt_en is required/);
  });
});
