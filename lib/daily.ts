// The daily datasets under `data/` and the deterministic pick that turns a
// publication date into one entry.
//
// The site is static and rebuilds when content lands, not on a clock, so the
// date driving the pick is the newest edition's `frontmatter.date` — a Prague
// publishing day by contract. That satisfies the Europe/Prague requirement
// without timezone code and keeps builds reproducible: same content in, same
// HTML out. A day without an edition honestly keeps the previous entry, exactly
// like the rest of the page.

export type LocalizedText = {
  /** One line, ends without a period where it is a fragment. */
  short: string;
  /** One to three sentences: the complete checkable statement. */
  full: string;
};

export type DatasetEntry = {
  id: string;
  slug: string;
  category: string;
  /** `mma-facts` only; `cross` = Czech/Slovak fighters in the UFC. */
  promotion?: "ufc" | "oktagon" | "cross";
  /** `ai-lessons` only; the display form of the buzzword. */
  term?: string;
  en: LocalizedText;
  cs: LocalizedText;
  /** YYYY-MM-DD — when this entry was last checked against its source. */
  verified: string;
  /** Short human pointer for re-verification, not necessarily a URL. */
  source: string;
};

export type DatasetCategory = { en: string; cs: string };

export type DatasetFile = {
  schemaVersion: "boardless-dataset/1";
  dataset: "ai-facts" | "mma-facts" | "ai-lessons";
  /** YYYY-MM-DD; origin of the daily index. */
  anchor: string;
  categories: Record<string, DatasetCategory>;
  /** Array order is the reveal order: day 0 is `entries[0]`. */
  entries: DatasetEntry[];
};

/** Whole days from anchor to dateKey; both are YYYY-MM-DD calendar dates. */
export function daysBetween(anchor: string, dateKey: string): number {
  const parse = (value: string): number => {
    const [y, m, d] = value.split("-").map(Number);
    if (y === undefined || m === undefined || d === undefined) {
      throw new Error(`invalid date key: ${value}`);
    }
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(dateKey) - parse(anchor)) / 86_400_000);
}

/** Clamp a possibly-missing or pre-anchor date to the anchor. ISO strings compare lexically. */
export function effectiveDateKey(anchor: string, dateKey: string | undefined): string {
  return dateKey !== undefined && dateKey >= anchor ? dateKey : anchor;
}

/** Deterministic daily pick: 0-based index into the entries array. */
export function dailyIndex(anchor: string, dateKey: string, length: number): number {
  if (length <= 0) throw new Error("dailyIndex requires a non-empty dataset");
  const n = daysBetween(anchor, dateKey);
  return ((n % length) + length) % length;
}

/** How many entries have been revealed so far (for the lesson archive). */
export function revealedCount(anchor: string, dateKey: string, length: number): number {
  if (length <= 0) throw new Error("revealedCount requires a non-empty dataset");
  return Math.max(1, Math.min(length, daysBetween(anchor, dateKey) + 1));
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

/**
 * The calendar date an entry at `index` is revealed on: `anchor` plus `index`
 * days. Integer arithmetic on purpose — nothing in the render path may read a
 * clock, so this never constructs a Date.
 */
export function revealDate(anchor: string, index: number): string {
  const [y, m, d] = anchor.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`invalid anchor: ${anchor}`);
  }
  let year = y;
  let month = m;
  let day = d + index;
  for (let span = daysInMonth(year, month); day > span; span = daysInMonth(year, month)) {
    day -= span;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}
