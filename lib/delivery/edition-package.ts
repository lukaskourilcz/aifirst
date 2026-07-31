import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020, { type AnySchema, type ValidateFunction } from "ajv/dist/2020.js";
import matter from "gray-matter";
import editionPackageSchema from "../../contracts/edition-package.schema.json";
import type { ArticleFrontmatter } from "../content.js";
import { serializeMdx } from "../content-write.js";
import { translationStructureErrors, validateArticleFrontmatter } from "../editorial/validation.js";

type LocalizedArticle = {
  frontmatter: ArticleFrontmatter;
  body: string;
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
  if (pkg.hero) {
    if (pkg.hero.path !== `public/illustrations/${pkg.date}.webp`) errors.push("hero path must match the authorized date path");
    for (const locale of ["en", "cs"] as const) {
      if (pkg.article[locale].frontmatter.illustration.path !== `/illustrations/${pkg.date}.webp`) {
        errors.push(`${pkg.date}.${locale}.mdx: illustration.path must match the delivered hero`);
      }
    }
  } else {
    for (const locale of ["en", "cs"] as const) {
      if (pkg.article[locale].frontmatter.illustration.path !== undefined) {
        errors.push(`${pkg.date}.${locale}.mdx: illustration.path requires a delivered hero`);
      }
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
  return serializeMdx(article.frontmatter, article.body);
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
  };
  return `${JSON.stringify(context, null, 2)}\n`;
}

async function existingHash(file: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    if (file.endsWith(".mdx")) {
      const { data } = matter(raw);
      const hash = (data.generation as { package_hash?: unknown } | undefined)?.package_hash;
      return typeof hash === "string" ? hash : "";
    }
    const data = JSON.parse(raw) as { packageHash?: unknown };
    return typeof data.packageHash === "string" ? data.packageHash : "";
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT" ? null : "";
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

export async function materializeEditionPackage(value: unknown, root = process.cwd()): Promise<DeliveryResult> {
  const pkg = validateDeliveryPackage(value);
  const boardFile = path.join(root, "public", "data", "board", `${pkg.date}.json`);
  const englishFile = path.join(root, "content", "articles", `${pkg.date}.en.mdx`);
  const englishHash = await existingHash(englishFile);
  if (englishHash !== null) {
    if (pkg.status === "edition" && englishHash === pkg.idempotencyKey) return { status: "noop", packageHash: pkg.idempotencyKey, paths: [] };
    throw new DeliveryError("hash_conflict", `${path.relative(root, englishFile)} already exists with a different package hash`);
  }
  const boardHash = await existingHash(boardFile);
  if (pkg.status === "no_edition" && boardHash !== null) {
    if (boardHash === pkg.idempotencyKey) return { status: "noop", packageHash: pkg.idempotencyKey, paths: [] };
    throw new DeliveryError("hash_conflict", `${path.relative(root, boardFile)} already exists with a different package hash`);
  }
  if (pkg.status === "edition") {
    const protectedFiles = [
      boardFile,
      path.join(root, "content", "articles", `${pkg.date}.cs.mdx`),
      ...(pkg.hero ? [path.join(root, "public", "illustrations", `${pkg.date}.webp`)] : []),
    ];
    for (const file of protectedFiles) {
      if (await existingHash(file) !== null) throw new DeliveryError("hash_conflict", `${path.relative(root, file)} exists without the English package identity file`);
    }
  }

  const prepared: Array<{ file: string; bytes: string | Buffer }> = [{ file: boardFile, bytes: boardBytes(pkg) }];
  if (pkg.status === "edition" && pkg.article) {
    prepared.push(
      { file: englishFile, bytes: mdxBytes(pkg.article.en) },
      { file: path.join(root, "content", "articles", `${pkg.date}.cs.mdx`), bytes: mdxBytes(pkg.article.cs) },
    );
    if (pkg.hero) prepared.push({ file: path.join(root, "public", "illustrations", `${pkg.date}.webp`), bytes: Buffer.from(pkg.hero.bytesBase64, "base64") });
  }
  await writePrepared(prepared);
  return {
    status: "written",
    packageHash: pkg.idempotencyKey,
    paths: prepared.map(({ file }) => path.relative(root, file)),
  };
}
