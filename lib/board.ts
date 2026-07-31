import fs from "node:fs/promises";
import path from "node:path";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HASH_RE = /^[a-f0-9]{64}$/;

type BoardContextBase = {
  schemaVersion: "board-context/1";
  date: string;
  packageHash: string;
  roomUrl: string;
  generationCostUsd?: number;
};

export type EditionBoardContext = BoardContextBase & {
  status: "edition";
  whyThisStory: string;
};

export type NoEditionBoardContext = BoardContextBase & {
  status: "no_edition";
  noEditionReason: string;
};

export type BoardContext = EditionBoardContext | NoEditionBoardContext;

export type BoardChangelogEntry = {
  date: string;
  summary: { en: string; cs: string };
  meetingUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function boardContextErrors(value: unknown, expectedDate?: string): string[] {
  if (!isRecord(value)) return ["board context must be an object"];
  const errors: string[] = [];
  if (value.schemaVersion !== "board-context/1") errors.push("schemaVersion must be board-context/1");
  if (!isRealDate(value.date)) errors.push("date must be a real YYYY-MM-DD date");
  if (expectedDate && value.date !== expectedDate) errors.push(`date must match filename ${expectedDate}.json`);
  if (typeof value.packageHash !== "string" || !HASH_RE.test(value.packageHash)) errors.push("packageHash must be a lowercase SHA-256 hash");
  if (!isHttpUrl(value.roomUrl)) errors.push("roomUrl must be an http(s) URL");
  if (value.generationCostUsd !== undefined && (typeof value.generationCostUsd !== "number" || !Number.isFinite(value.generationCostUsd) || value.generationCostUsd < 0)) {
    errors.push("generationCostUsd must be a finite non-negative number when present");
  }
  if (value.status === "edition") {
    if (!isText(value.whyThisStory, 280)) errors.push("edition context requires whyThisStory (1-280 characters)");
    if (value.noEditionReason !== undefined) errors.push("edition context must not contain noEditionReason");
  } else if (value.status === "no_edition") {
    if (!isText(value.noEditionReason, 280)) errors.push("no_edition context requires noEditionReason (1-280 characters)");
    if (value.whyThisStory !== undefined) errors.push("no_edition context must not contain whyThisStory");
  } else {
    errors.push("status must be edition or no_edition");
  }
  return errors;
}

export function parseBoardContext(value: unknown, expectedDate?: string): BoardContext | null {
  return boardContextErrors(value, expectedDate).length === 0 ? value as BoardContext : null;
}

function defaultBoardDir(): string {
  return path.join(process.cwd(), "public", "data", "board");
}

export async function readBoardContext(date: string, dir = defaultBoardDir()): Promise<BoardContext | null> {
  if (!DATE_RE.test(date)) return null;
  try {
    const value = JSON.parse(await fs.readFile(path.join(dir, `${date}.json`), "utf8")) as unknown;
    return parseBoardContext(value, date);
  } catch {
    return null;
  }
}

export async function listBoardContexts(dir = defaultBoardDir()): Promise<BoardContext[]> {
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const contexts = await Promise.all(
    files
      .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
      .map(async (file) => readBoardContext(file.slice(0, 10), dir)),
  );
  return contexts
    .filter((context): context is BoardContext => context !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function boardChangelogErrors(value: unknown): string[] {
  if (!isRecord(value)) return ["board changelog must be an object"];
  const errors: string[] = [];
  if (value.schemaVersion !== 1) errors.push("board changelog schemaVersion must be 1");
  if (!Array.isArray(value.entries)) return [...errors, "board changelog entries must be an array"];
  for (const [index, entry] of value.entries.entries()) {
    if (!isRecord(entry)) {
      errors.push(`entries[${index}] must be an object`);
      continue;
    }
    if (!isRealDate(entry.date)) errors.push(`entries[${index}].date must be a real date`);
    if (!isRecord(entry.summary) || !isText(entry.summary.en, 240) || !isText(entry.summary.cs, 240)) {
      errors.push(`entries[${index}].summary requires concise en and cs text`);
    }
    if (!isHttpUrl(entry.meetingUrl)) errors.push(`entries[${index}].meetingUrl must be http(s)`);
  }
  return errors;
}

export async function loadBoardChangelog(file = path.join(process.cwd(), "config", "board-changelog.json")): Promise<BoardChangelogEntry[]> {
  const value = JSON.parse(await fs.readFile(file, "utf8")) as unknown;
  const errors = boardChangelogErrors(value);
  if (errors.length) throw new Error(errors.join("; "));
  return (value as { entries: BoardChangelogEntry[] }).entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}
