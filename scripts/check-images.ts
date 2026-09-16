#!/usr/bin/env tsx
// Measures every delivered edition picture against the rules that decide how a
// reader first meets an edition off-site.
//
// Google Discover only offers a large image preview from 1200 px wide up, and
// the Article reference expects the declared image to be the one that actually
// ships. An edition whose hero is missing, narrower than that floor, or whose
// declared dimensions disagree with its bytes fails here rather than quietly
// losing the preview.

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import { readMdxFiles, type ArticleFrontmatter } from "../lib/content.js";
import { LARGE_IMAGE_MIN_WIDTH } from "../lib/editorial/structured-data.js";

/** The delivery contract fixes the card thumbnail at this size; see lib/delivery/edition-package.ts. */
const THUMBNAIL_SIZE = { width: 640, height: 360 } as const;

const ALLOWED_FORMATS = new Set(["webp", "png", "jpeg", "jpg", "svg"]);

type Measurement = { format: string; width: number; height: number };

async function measure(sitePath: string): Promise<Measurement | null> {
  const abs = path.join(process.cwd(), "public", sitePath.replace(/^\//, ""));
  try {
    const meta = await sharp(abs).metadata();
    if (!meta.format || meta.width === undefined || meta.height === undefined) return null;
    return { format: meta.format, width: meta.width, height: meta.height };
  } catch {
    return null;
  }
}

async function main() {
  const dir = path.join(process.cwd(), "content", "articles");
  const files = await readMdxFiles(dir);
  const errors: string[] = [];
  let measured = 0;

  for (const file of files) {
    const { data } = matter(await fs.readFile(path.join(dir, file), "utf8"));
    const fm = data as ArticleFrontmatter;
    const illustration = fm.illustration ?? {};
    const heroPath = illustration.path;
    const isSchemaV2 = fm.schema_version === 2;

    if (!heroPath) {
      // Legacy editions predate the media boundary and are allowed to carry no
      // picture at all; the reader has a complete text-first fallback for them.
      if (isSchemaV2) errors.push(`${file}: schema v2 edition has no illustration.path`);
      continue;
    }

    const hero = await measure(heroPath);
    if (!hero) {
      errors.push(`${file}: illustration.path ${heroPath} is missing or unreadable`);
    } else {
      measured += 1;
      if (!ALLOWED_FORMATS.has(hero.format)) {
        errors.push(`${file}: hero format ${hero.format} is outside webp/png/jpeg/svg`);
      }
      if (hero.width < LARGE_IMAGE_MIN_WIDTH) {
        errors.push(
          `${file}: hero is ${hero.width}px wide, below the ${LARGE_IMAGE_MIN_WIDTH}px large-preview floor`,
        );
      }
      if (isSchemaV2) {
        if (illustration.width === undefined || illustration.height === undefined) {
          errors.push(`${file}: schema v2 illustration must declare width and height`);
        } else if (illustration.width !== hero.width || illustration.height !== hero.height) {
          errors.push(
            `${file}: illustration declares ${illustration.width}x${illustration.height} but the file is ${hero.width}x${hero.height}`,
          );
        }
      }
    }

    const thumbnailPath = illustration.thumbnail_path;
    if (thumbnailPath) {
      const thumbnail = await measure(thumbnailPath);
      if (!thumbnail) {
        errors.push(`${file}: thumbnail_path ${thumbnailPath} is missing or unreadable`);
      } else {
        measured += 1;
        if (!ALLOWED_FORMATS.has(thumbnail.format)) {
          errors.push(`${file}: thumbnail format ${thumbnail.format} is outside webp/png/jpeg/svg`);
        }
        // The thumbnail is the card image, not the Discover image, so it keeps
        // its exact delivery size instead of the 1200px floor.
        if (thumbnail.width !== THUMBNAIL_SIZE.width || thumbnail.height !== THUMBNAIL_SIZE.height) {
          errors.push(
            `${file}: thumbnail is ${thumbnail.width}x${thumbnail.height}, not ${THUMBNAIL_SIZE.width}x${THUMBNAIL_SIZE.height}`,
          );
        }
      }
    } else if (isSchemaV2) {
      errors.push(`${file}: schema v2 edition has no illustration.thumbnail_path`);
    }
  }

  if (errors.length) {
    console.error(`[images] ${errors.length} issue(s) found:\n\n${errors.map((error) => `  ${error}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`[images] ${measured} edition image(s) across ${files.length} MDX file(s) measured, no issues`);
}

main().catch((error) => {
  console.error("[images] FAILED:", error);
  process.exit(1);
});
