// The optional `practical` block of a schema-v2 edition: the one thing a reader
// can act on the same morning — a prompt, a tool, a term or a how-to.
//
// Two shapes arrive, and both are read into one list of items:
//
// - the marketing contract (CONTRACTS.md §2, 2026-11), one flat item:
//   `{ type: prompt|tool|term, title, text, url?, verified_at? }`
// - BoardlessAI's writer block (quorum `orchestrator/src/contracts/practical.ts`):
//   `{ variant: daily|friday-tools, items: [{ kind: prompt|tool|howto, title, body, source_url }] }`
//
// Absent is the normal state and renders nothing. Present and malformed is a
// content error: validation fails the delivery rather than showing a half item.
// quorum grounds every block URL in the edition's own sources before delivery;
// this file checks shape, bounds and dates, which it can do without a network.

export const PRACTICAL_TYPES = ["prompt", "tool", "term", "howto"] as const;
export type PracticalType = (typeof PRACTICAL_TYPES)[number];

export const PRACTICAL_TITLE_MAX = 80;
/** CONTRACTS.md §2: the flat item's text. */
export const PRACTICAL_TEXT_MAX = 400;
/** quorum's writer block: body bounds. */
export const PRACTICAL_BODY_MIN = 40;
export const PRACTICAL_BODY_MAX = 600;
export const PRACTICAL_ITEMS_MAX = 4;

export type PracticalItem = {
  type: PracticalType;
  title: string;
  text: string;
  url?: string;
  /** YYYY-MM-DD; when the link or price was last checked. */
  verified_at?: string;
};

export type PracticalBlock = {
  /** `friday-tools` only for quorum's Friday tools issue. */
  variant: "daily" | "friday-tools";
  items: PracticalItem[];
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
// A figure followed or preceded by a currency: „od 490 Kč", „$20/měsíc", „9 €".
const PRICE = /(\d[\d\s.,]*\s?(Kč|CZK|€|EUR|USD|\$))|((\$|€)\s?\d)/iu;

function realDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function httpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function mentionsPrice(value: string): boolean {
  return PRICE.test(value);
}

function flatItemErrors(raw: Record<string, unknown>, date: string | undefined, at: string): string[] {
  const errors: string[] = [];
  const type = raw.type;
  if (type !== "prompt" && type !== "tool" && type !== "term") {
    errors.push(`${at}.type must be prompt, tool or term`);
  }
  const title = text(raw.title);
  if (!title || title.length > PRACTICAL_TITLE_MAX) errors.push(`${at}.title must be 1-${PRACTICAL_TITLE_MAX} characters`);
  const body = text(raw.text);
  if (!body || body.length > PRACTICAL_TEXT_MAX) errors.push(`${at}.text must be 1-${PRACTICAL_TEXT_MAX} characters`);
  if (raw.url !== undefined && !httpsUrl(raw.url)) errors.push(`${at}.url must be an https URL`);
  if (type === "tool" && raw.url === undefined) errors.push(`${at}.url is required for a tool`);
  const needsVerification = raw.url !== undefined || mentionsPrice(`${title} ${body}`);
  if (raw.verified_at === undefined) {
    if (needsVerification) errors.push(`${at}.verified_at is required when a url or a price is given`);
  } else if (!realDate(raw.verified_at)) {
    errors.push(`${at}.verified_at must be a real YYYY-MM-DD date`);
  } else if (date && raw.verified_at > date) {
    errors.push(`${at}.verified_at ${raw.verified_at} is later than the edition date ${date}`);
  }
  return errors;
}

function blockItemErrors(raw: unknown, at: string): string[] {
  if (!raw || typeof raw !== "object") return [`${at} must be an object`];
  const item = raw as Record<string, unknown>;
  const errors: string[] = [];
  if (item.kind !== "prompt" && item.kind !== "tool" && item.kind !== "howto") errors.push(`${at}.kind must be prompt, tool or howto`);
  const title = text(item.title);
  if (!title || title.length > PRACTICAL_TITLE_MAX) errors.push(`${at}.title must be 1-${PRACTICAL_TITLE_MAX} characters`);
  const body = text(item.body);
  if (body.length < PRACTICAL_BODY_MIN || body.length > PRACTICAL_BODY_MAX) errors.push(`${at}.body must be ${PRACTICAL_BODY_MIN}-${PRACTICAL_BODY_MAX} characters`);
  if (!httpsUrl(item.source_url)) errors.push(`${at}.source_url must be an https URL`);
  if (item.verified_at !== undefined && !realDate(item.verified_at)) errors.push(`${at}.verified_at must be a real YYYY-MM-DD date`);
  return errors;
}

/** Every problem with a `practical` value on an edition dated `date`; empty when valid. */
export function practicalErrors(raw: unknown, date?: string): string[] {
  if (raw === undefined) return [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return ["practical must be an object"];
  const value = raw as Record<string, unknown>;
  if ("items" in value || "variant" in value) {
    const errors: string[] = [];
    if (value.variant !== "daily" && value.variant !== "friday-tools") errors.push("practical.variant must be daily or friday-tools");
    if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > PRACTICAL_ITEMS_MAX) {
      errors.push(`practical.items must hold 1-${PRACTICAL_ITEMS_MAX} items`);
      return errors;
    }
    if (value.variant === "daily" && value.items.length !== 1) errors.push("a daily practical block carries exactly one item");
    value.items.forEach((item, index) => errors.push(...blockItemErrors(item, `practical.items[${index}]`)));
    const titles = value.items.map((item) => text((item as Record<string, unknown> | null)?.title).toLocaleLowerCase("cs"));
    if (new Set(titles).size !== titles.length) errors.push("two practical items share a title");
    return errors;
  }
  return flatItemErrors(value, date, "practical");
}

/**
 * The block a reader sees, or null. Never throws: an invalid value reads as
 * absent, because validation has already failed the delivery that carried it.
 */
export function readPractical(raw: unknown, date?: string): PracticalBlock | null {
  if (raw === undefined || practicalErrors(raw, date).length > 0) return null;
  const value = raw as Record<string, unknown>;
  if (Array.isArray(value.items)) {
    return {
      variant: value.variant === "friday-tools" ? "friday-tools" : "daily",
      items: value.items.map((entry) => {
        const item = entry as Record<string, unknown>;
        return {
          type: item.kind as PracticalType,
          title: text(item.title),
          text: text(item.body),
          url: item.source_url as string,
          ...(realDate(item.verified_at) ? { verified_at: item.verified_at } : {}),
        };
      }),
    };
  }
  return {
    variant: "daily",
    items: [{
      type: value.type as PracticalType,
      title: text(value.title),
      text: text(value.text),
      ...(httpsUrl(value.url) ? { url: value.url } : {}),
      ...(realDate(value.verified_at) ? { verified_at: value.verified_at } : {}),
    }],
  };
}

const TYPE_LABELS_CS: Record<PracticalType, string> = {
  prompt: "Prompt",
  tool: "Nástroj",
  term: "Pojem",
  howto: "Návod",
};

export function practicalTypeLabel(type: PracticalType): string {
  return TYPE_LABELS_CS[type];
}
