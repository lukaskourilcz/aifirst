import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020, { type AnySchema, type ValidateFunction } from "ajv/dist/2020.js";
import editionPackageSchema from "../../contracts/edition-package.schema.json";
import type { ArticleFrontmatter } from "../content.js";
import { serializeDeliveredMdx } from "./mdx.js";
import { translationStructureErrors, validateArticleFrontmatter } from "../editorial/validation.js";
import sharp from "sharp";

type LocalizedArticle = {
  frontmatter: ArticleFrontmatter;
  body: string;
};

export type ArticleImage = {
  hero_path: string;
  thumb_path: string;
  width: number;
  height: number;
  alt_en?: string;
  alt_cs: string;
  license: {
    name: "CC0" | "CC BY" | "CC BY-SA" | "Pexels License" | "Pixabay Content License" | "BoardlessAI deterministic" | "BoardlessAI illustration";
    author: string;
    source_url: string;
    attribution_html: string;
  };
  /**
   * What the picture is. `photo` was taken by somebody, `svg` is the deterministic FRAME plate,
   * and `illustration` was rendered by a machine — BoardlessAI labels it as one in its own alt
   * text, and this side checks the bytes match what the origin claims.
   */
  origin: "photo" | "svg" | "illustration";
  hero_bytes_base64: string;
  thumb_bytes_base64: string;
};

export type EditionPackage = {
  schemaVersion: "edition-package/1";
  date: string;
  idempotencyKey: string;
  generation: { models: Record<string, string>; costUsd?: number };
  reason: string;
  board: {
    meetingRef: string;
    roomUrl: string;
    whyThisStory?: string;
    noEditionReason?: string;
  };
  status: "edition" | "no_edition";
  article?: { en: LocalizedArticle; cs: LocalizedArticle };
  image?: ArticleImage;
  hero?: { path: string; bytesBase64: string };
};

export type DeliveryResult = {
  status: "written" | "noop";
  packageHash: string;
  paths: string[];
};

export class DeliveryError extends Error {
  constructor(public readonly code: "schema_invalid" | "content_invalid" | "hash_conflict", message: string) {
    super(message);
    this.name = "DeliveryError";
  }
}

function makeValidator(): ValidateFunction {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    formats: { base64: true, date: true, "date-time": true, uri: true },
  });
  return ajv.compile(editionPackageSchema as AnySchema);
}

const validateSchema = makeValidator();

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(",")}}`;
}

function hashView(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(hashView);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "idempotencyKey" && key !== "package_hash")
      .map(([key, child]) => [key, hashView(child)]),
  );
}

export function editionPackageHash(value: unknown): string {
  return createHash("sha256").update(canonical(hashView(value))).digest("hex");
}

export function parseEditionPackage(value: unknown): EditionPackage {
  if (!validateSchema(value)) {
    const detail = (validateSchema.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`).join("; ");
    throw new DeliveryError("schema_invalid", detail || "package does not match edition-package/1");
  }
  return value as EditionPackage;
}

function contentErrors(pkg: EditionPackage): string[] {
  if (pkg.idempotencyKey !== editionPackageHash(pkg)) return ["idempotencyKey does not match the canonical package hash"];
  if (pkg.status === "no_edition") return [];
  if (!pkg.article) return ["edition package is missing article content"];
  if (!pkg.image) return ["edition package is missing its required image block"];

  const errors: string[] = [];
  const entries = (["en", "cs"] as const).map((locale) => {
    const localized = pkg.article?.[locale];
    if (!localized) return null;
    const file = `${pkg.date}.${locale}.mdx`;
    errors.push(...validateArticleFrontmatter(localized.frontmatter as unknown as Record<string, unknown>, file));
    if (!localized.body.trim()) errors.push(`${file}: body is empty`);
    if (localized.frontmatter.date !== pkg.date) errors.push(`${file}: frontmatter date differs from package date`);
    if (localized.frontmatter.lang !== locale) errors.push(`${file}: frontmatter lang must be ${locale}`);
    const packageHash = (localized.frontmatter.generation as (ArticleFrontmatter["generation"] & { package_hash?: string }) | undefined)?.package_hash;
    if (packageHash !== pkg.idempotencyKey) errors.push(`${file}: generation.package_hash must match idempotencyKey`);
    return { file, fm: localized.frontmatter };
  }).filter((entry): entry is { file: string; fm: ArticleFrontmatter } => entry !== null);
  errors.push(...translationStructureErrors(entries));
  if (pkg.article.en && !pkg.image.alt_en) {
    errors.push("image.alt_en is required when article.en is present");
  }
  // Czech is the locale that is always delivered; English is optional and on its way out.
  // The slug is identical across locales, so it is read from the half that cannot be absent.
  const slug = pkg.article.cs.frontmatter.slug;
  const assetPattern = new RegExp(`^public/images/editions/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(hero|thumb)\\.(webp|png|svg)$`);
  if (!assetPattern.test(pkg.image.hero_path) || !pkg.image.hero_path.includes("/hero.")) {
    errors.push("image.hero_path must use the article's authorized hero path");
  }
  if (!assetPattern.test(pkg.image.thumb_path) || !pkg.image.thumb_path.includes("/thumb.")) {
    errors.push("image.thumb_path must use the article's authorized thumbnail path");
  }
  if (pkg.image.hero_path === pkg.image.thumb_path) errors.push("hero and thumbnail paths must differ");
  if (Buffer.byteLength(pkg.image.hero_bytes_base64, "base64") > 800_000) errors.push("hero image exceeds 800 kB");
  if (Buffer.byteLength(pkg.image.thumb_bytes_base64, "base64") > 300_000) errors.push("thumbnail image exceeds 300 kB");
  const expectedPath = pkg.image.hero_path.replace(/^public/, "");
  const expectedThumb = pkg.image.thumb_path.replace(/^public/, "");
  for (const locale of (["en", "cs"] as const).filter((value) => pkg.article?.[value])) {
    const illustration = pkg.article[locale]!.frontmatter.illustration;
    if (illustration.path?.startsWith("/images/") && illustration.path !== expectedPath) {
      errors.push(`${pkg.date}.${locale}.mdx: illustration.path must match the delivered image`);
    }
    if (illustration.thumbnail_path && illustration.thumbnail_path !== expectedThumb) {
      errors.push(`${pkg.date}.${locale}.mdx: illustration.thumbnail_path must match the delivered image`);
    }
    const expectedAlt = locale === "en" ? pkg.image.alt_en : pkg.image.alt_cs;
    if (illustration.origin && illustration.alt !== expectedAlt) {
      errors.push(`${pkg.date}.${locale}.mdx: illustration.alt must match the delivered locale`);
    }
  }
  return errors;
}

export function validateDeliveryPackage(value: unknown): EditionPackage {
  const pkg = parseEditionPackage(value);
  const errors = contentErrors(pkg);
  if (errors.length) throw new DeliveryError("content_invalid", errors.join("; "));
  return pkg;
}

function mdxBytes(article: LocalizedArticle): string {
  return serializeDeliveredMdx(article.frontmatter, article.body);
}

function boardBytes(pkg: EditionPackage): string {
  const context = {
    schemaVersion: "board-context/1",
    date: pkg.date,
    packageHash: pkg.idempotencyKey,
    status: pkg.status,
    ...(pkg.status === "edition" ? { whyThisStory: pkg.board.whyThisStory } : { noEditionReason: pkg.board.noEditionReason }),
    roomUrl: pkg.board.roomUrl,
    ...(pkg.generation.costUsd === undefined ? {} : { generationCostUsd: pkg.generation.costUsd }),
    ...(pkg.status === "edition" && pkg.image
      ? { image: { heroPath: pkg.image.hero_path, thumbPath: pkg.image.thumb_path, origin: pkg.image.origin } }
      : {}),
  };
  return `${JSON.stringify(context, null, 2)}\n`;
}

async function existingBytes(file: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function asBuffer(bytes: string | Buffer): Buffer {
  return Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
}

function isProvisionalNoEditionBoard(bytes: Buffer | null, pkg: EditionPackage): boolean {
  if (!bytes || pkg.status !== "edition") return false;
  try {
    const board = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
    return board.schemaVersion === "board-context/1" &&
      board.date === pkg.date &&
      board.status === "no_edition";
  } catch {
    return false;
  }
}

async function writePrepared(files: Array<{ file: string; bytes: string | Buffer }>): Promise<void> {
  for (const { file } of files) await fs.mkdir(path.dirname(file), { recursive: true });
  const staged = files.map(({ file, bytes }) => ({ file, temp: `${file}.boardlessai-${process.pid}.tmp`, bytes }));
  try {
    for (const item of staged) await fs.writeFile(item.temp, item.bytes);
    for (const item of staged) await fs.rename(item.temp, item.file);
  } finally {
    await Promise.all(staged.map((item) => fs.rm(item.temp, { force: true })));
  }
}

async function validateImageBytes(pkg: EditionPackage): Promise<void> {
  if (pkg.status !== "edition" || !pkg.image) return;
  const hero = Buffer.from(pkg.image.hero_bytes_base64, "base64");
  const thumb = Buffer.from(pkg.image.thumb_bytes_base64, "base64");
  if (!hero.length || !thumb.length) throw new DeliveryError("content_invalid", "delivered image bytes are empty");
  try {
    const [heroMetadata, thumbMetadata] = await Promise.all([sharp(hero).metadata(), sharp(thumb).metadata()]);
    if (heroMetadata.width !== pkg.image.width || heroMetadata.height !== pkg.image.height) {
      throw new Error(`hero dimensions ${heroMetadata.width ?? 0}x${heroMetadata.height ?? 0} differ from ${pkg.image.width}x${pkg.image.height}`);
    }
    if (thumbMetadata.width !== 640 || thumbMetadata.height !== 360) {
      throw new Error(`thumbnail dimensions ${thumbMetadata.width ?? 0}x${thumbMetadata.height ?? 0} differ from 640x360`);
    }
    if (["photo", "illustration"].includes(pkg.image.origin) && !["webp", "png", "jpeg"].includes(heroMetadata.format ?? "")) {
      throw new Error("a photograph or illustration must be a supported raster image");
    }
    if (pkg.image.origin === "svg" && heroMetadata.format !== "svg") {
      throw new Error("FRAME fallback must contain SVG bytes");
    }
  } catch (error) {
    if (error instanceof DeliveryError) throw error;
    throw new DeliveryError("content_invalid", error instanceof Error ? error.message : "delivered image is invalid");
  }
}

export async function materializeEditionPackage(value: unknown, root = process.cwd()): Promise<DeliveryResult> {
  const pkg = validateDeliveryPackage(value);
  await validateImageBytes(pkg);
  const boardFile = path.join(root, "public", "data", "board", `${pkg.date}.json`);
  const prepared: Array<{ file: string; bytes: string | Buffer }> = [{ file: boardFile, bytes: boardBytes(pkg) }];
  if (pkg.status === "edition" && pkg.article) {
    // One file per locale the package carries, rather than a fixed pair. A Czech-only package
    // must not write an empty .en.mdx, and the workflow stages exactly what is written here.
    for (const locale of ["en", "cs"] as const) {
      const localized = pkg.article[locale];
      if (!localized) continue;
      prepared.push({ file: path.join(root, "content", "articles", `${pkg.date}.${locale}.mdx`), bytes: mdxBytes(localized) });
    }
    if (pkg.image) {
      prepared.push(
        { file: path.join(root, pkg.image.hero_path), bytes: Buffer.from(pkg.image.hero_bytes_base64, "base64") },
        { file: path.join(root, pkg.image.thumb_path), bytes: Buffer.from(pkg.image.thumb_bytes_base64, "base64") },
      );
    }
  }

  const existing = await Promise.all(prepared.map(({ file }) => existingBytes(file)));
  if (existing.some((bytes) => bytes !== null)) {
    const [existingBoard, ...existingArticleFiles] = existing;
    if (
      isProvisionalNoEditionBoard(existingBoard ?? null, pkg) &&
      existingArticleFiles.every((bytes) => bytes === null)
    ) {
      await writePrepared(prepared);
      return {
        status: "written",
        packageHash: pkg.idempotencyKey,
        paths: prepared.map(({ file }) => path.relative(root, file)),
      };
    }
    const conflictIndex = existing.findIndex((bytes, index) => bytes === null || !bytes.equals(asBuffer(prepared[index]!.bytes)));
    if (conflictIndex === -1) return { status: "noop", packageHash: pkg.idempotencyKey, paths: [] };
    const conflictFile = prepared[conflictIndex]!.file;
    throw new DeliveryError(
      "hash_conflict",
      `${path.relative(root, conflictFile)} is missing or differs from the immutable delivered bytes`,
    );
  }

  await writePrepared(prepared);
  return {
    status: "written",
    packageHash: pkg.idempotencyKey,
    paths: prepared.map(({ file }) => path.relative(root, file)),
  };
}
