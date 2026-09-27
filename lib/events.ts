// `boardless-events/1` — the events behind /akce. The owner maintains them in
// the BoardlessAI admin; this repository only reads the delivered file.
//
// Upcoming and past are split against the newest edition's date, never a clock,
// so the same content always builds the same page.

import fs from "node:fs";
import path from "node:path";

export const EVENT_SCOPES = ["cz", "global"] as const;
export type EventScope = (typeof EVENT_SCOPES)[number];

export type MagazineEvent = {
  id: string;
  scope: EventScope;
  title: string;
  description?: string | null;
  /** YYYY-MM-DD */
  starts: string;
  ends?: string | null;
  city?: string | null;
  venue?: string | null;
  online: boolean;
  url: string;
  price?: string | null;
  organizer?: string | null;
  added?: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown, max: number): string | undefined {
  return typeof value === "string" && value.trim() && value.trim().length <= max ? value.trim() : undefined;
}

export function parseEvent(value: unknown): MagazineEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const title = text(v.title, 120);
  if (typeof v.id !== "string" || !v.id) return null;
  if (!title) return null;
  if (typeof v.scope !== "string" || !(EVENT_SCOPES as readonly string[]).includes(v.scope)) return null;
  if (typeof v.starts !== "string" || !DATE.test(v.starts)) return null;
  if (typeof v.url !== "string" || !v.url.startsWith("https://")) return null;
  const ends = typeof v.ends === "string" && DATE.test(v.ends) ? v.ends : undefined;
  if (ends && ends < v.starts) return null;

  return {
    id: v.id,
    scope: v.scope as EventScope,
    title,
    starts: v.starts,
    online: v.online === true,
    url: v.url,
    ...(ends ? { ends } : {}),
    ...(text(v.description, 280) ? { description: text(v.description, 280) } : {}),
    ...(text(v.city, 80) ? { city: text(v.city, 80) } : {}),
    ...(text(v.venue, 120) ? { venue: text(v.venue, 120) } : {}),
    ...(text(v.price, 80) ? { price: text(v.price, 80) } : {}),
    ...(text(v.organizer, 120) ? { organizer: text(v.organizer, 120) } : {}),
    ...(typeof v.added === "string" && DATE.test(v.added) ? { added: v.added } : {}),
  };
}

function dataDir(): string {
  return path.join(process.cwd(), "data");
}

/** Never throws: a missing or malformed file is an empty events page. */
export function loadEvents(dir = dataDir()): MagazineEvent[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(path.join(dir, "events.json"), "utf8"));
  } catch {
    return [];
  }
  if (typeof parsed !== "object" || parsed === null) return [];
  const file = parsed as Record<string, unknown>;
  if (file.schemaVersion !== "boardless-events/1") return [];
  if (!Array.isArray(file.events)) return [];

  const seen = new Set<string>();
  const events: MagazineEvent[] = [];
  for (const raw of file.events) {
    const event = parseEvent(raw);
    if (!event || seen.has(event.id)) continue;
    seen.add(event.id);
    events.push(event);
  }
  return events;
}

/**
 * An event counts as upcoming while its last day has not passed the anchor, so
 * a multi-day conference stays listed on its middle days.
 */
export function splitByAnchor(
  events: MagazineEvent[],
  anchor: string,
): { upcoming: MagazineEvent[]; past: MagazineEvent[] } {
  const upcoming: MagazineEvent[] = [];
  const past: MagazineEvent[] = [];
  for (const event of events) {
    if ((event.ends ?? event.starts) >= anchor) upcoming.push(event);
    else past.push(event);
  }
  upcoming.sort((a, b) => a.starts.localeCompare(b.starts) || a.title.localeCompare(b.title));
  past.sort((a, b) => b.starts.localeCompare(a.starts) || a.title.localeCompare(b.title));
  return { upcoming, past };
}

export function byScope(events: MagazineEvent[], scope: EventScope): MagazineEvent[] {
  return events.filter((event) => event.scope === scope);
}

const CS_MONTHS_SHORT = [
  "LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČVN",
  "ČVC", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO",
] as const;

/** The date block: „14" over „ŘÍJ". */
export function eventDateBlock(dateKey: string): { day: string; month: string } {
  const [, m, d] = dateKey.split("-").map(Number);
  return {
    day: String(d ?? 1),
    month: CS_MONTHS_SHORT[(m ?? 1) - 1] ?? "",
  };
}

/**
 * „Praha · Fórum Karlín", or nothing when neither is known. Online is a
 * badge of its own (`eventBadges`), so the place never repeats it.
 */
export function eventPlace(event: MagazineEvent): string | null {
  const parts = [event.city, event.venue].filter((p): p is string => Boolean(p));
  return parts.length ? parts.join(" · ") : null;
}

const CS_MONTHS_GENITIVE = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
] as const;

function dateParts(dateKey: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateKey.split("-").map(Number);
  return { y: y ?? 1970, m: m ?? 1, d: d ?? 1 };
}

/**
 * The Czech date line: „14. října 2026", „14.–16. října 2026",
 * „30. září – 2. října 2026", „30. prosince 2026 – 2. ledna 2027".
 */
export function eventDateLabel(event: Pick<MagazineEvent, "starts" | "ends">): string {
  const a = dateParts(event.starts);
  const month = (m: number) => CS_MONTHS_GENITIVE[m - 1] ?? String(m);
  if (!event.ends || event.ends === event.starts) return `${a.d}. ${month(a.m)} ${a.y}`;
  const b = dateParts(event.ends);
  if (a.y !== b.y) return `${a.d}. ${month(a.m)} ${a.y} – ${b.d}. ${month(b.m)} ${b.y}`;
  if (a.m !== b.m) return `${a.d}. ${month(a.m)} – ${b.d}. ${month(b.m)} ${b.y}`;
  return `${a.d}.–${b.d}. ${month(b.m)} ${b.y}`;
}

// „zdarma", „vstup zdarma", „Free", „0 Kč". A price that merely mentions a
// free tier („zdarma pro členy, jinak 490 Kč") is not free and keeps its text.
const FREE = /^(vstup\s+)?(zdarma|free|0\s*(Kč|CZK|€|EUR|USD|\$))\.?$/iu;

export function isFreeEvent(event: Pick<MagazineEvent, "price">): boolean {
  return typeof event.price === "string" && FREE.test(event.price.trim());
}

export type EventBadge = "online" | "free";

export function eventBadges(event: MagazineEvent): EventBadge[] {
  const badges: EventBadge[] = [];
  if (event.online) badges.push("online");
  if (isFreeEvent(event)) badges.push("free");
  return badges;
}

/** The host a reader is sent to, shown as the event's source: „lu.ma". */
export function eventSource(event: Pick<MagazineEvent, "url">): string {
  try {
    return new URL(event.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
