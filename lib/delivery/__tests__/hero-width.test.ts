import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import validFixture from "../../../contracts/fixtures/edition-package.valid.json";
import { DISCOVER_MIN_HERO_WIDTH, editionPackageHash, materializeEditionPackage } from "../edition-package";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true }))));

async function tempRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-hero-width-"));
  roots.push(root);
  return root;
}

async function photoFixture(width: number, height: number): Promise<Record<string, any>> {
  const sharp = (await import("sharp")).default;
  const value = structuredClone(validFixture) as Record<string, any>;
  const raster = (w: number, h: number) =>
    sharp({ create: { width: w, height: h, channels: 3, background: { r: 10, g: 12, b: 20 } } }).webp().toBuffer();
  value.image.origin = "photo";
  value.image.width = width;
  value.image.height = height;
  value.image.hero_bytes_base64 = (await raster(width, height)).toString("base64");
  value.image.thumb_bytes_base64 = (await raster(640, 360)).toString("base64");
  for (const locale of ["en", "cs"]) value.article[locale].frontmatter.illustration.origin = "photo";
  // The shared fixture carries one why_it_matters item and schema v2 wants two or three.
  value.article.en.frontmatter.why_it_matters.push("Production limits still decide the realized saving.");
  value.article.cs.frontmatter.why_it_matters.push("Skutečnou úsporu stále určují produkční limity.");
  const hash = editionPackageHash(value);
  value.idempotencyKey = hash;
  value.article.en.frontmatter.generation.package_hash = hash;
  value.article.cs.frontmatter.generation.package_hash = hash;
  return value;
}

describe("Discover hero width", () => {
  it("delivers a narrow photograph and says why Discover will not show it", async () => {
    const result = await materializeEditionPackage(await photoFixture(800, 450), await tempRoot());
    expect(result.status).toBe("written");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain(`${DISCOVER_MIN_HERO_WIDTH}px`);
  });

  it("stays silent for a hero at the Discover floor", async () => {
    const result = await materializeEditionPackage(await photoFixture(DISCOVER_MIN_HERO_WIDTH, 675), await tempRoot());
    expect(result.status).toBe("written");
    expect(result.warnings).toEqual([]);
  });
});
