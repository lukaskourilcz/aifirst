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
      "public/illustrations/2026-08-04.webp",
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
      async (root: string) => fs.appendFile(path.join(root, "public/illustrations/2026-08-04.webp"), Buffer.from([0])),
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
