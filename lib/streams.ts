// `boardless-stream/1` — the external link streams behind /o-cem-se-mluvi and
// /podcasty. BoardlessAI writes the files; this repository only reads them.
//
// Nothing here fetches. A missing, empty or malformed file yields an empty
// list, because a stream that failed to sync must cost a section, never a
// build.

import fs from "node:fs";
import path from "node:path";

export const STREAM_SOURCE_KINDS = ["medium", "substack", "blog", "youtube", "rss"] as const;
export type StreamSourceKind = (typeof STREAM_SOURCE_KINDS)[number];

export type StreamSource = {
  kind: StreamSourceKind;
  name: string;
  feed?: string;
};

export type StreamItem = {
  /** sha1 of the canonical URL, assigned upstream. */
  id: string;
  title: string;
  url: string;
  source: StreamSource;
  author?: string | null;
  /** YYYY-MM-DD */
  published: string;
  summary?: string | null;
  weight?: number;
  /** Podcast episodes only. */
  show?: string;
  durationSec?: number;
  links?: { youtube?: string; spotify?: string; apple?: string; rss?: string };
};

export type StreamFile = {
  schemaVersion: "boardless-stream/1";
  stream: StreamName;
  updated: string;
  windowDays: number;
  items: StreamItem[];
};

export const STREAM_NAMES = ["talked-about", "podcasts"] as const;
export type StreamName = (typeof STREAM_NAMES)[number];

const FILES: Record<StreamName, string> = {
  "talked-about": "talked-about.json",
  podcasts: "podcasts.json",
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isHttps(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("https://");
}

/** One item survives only if every field the UI renders is actually usable. */
export function parseStreamItem(value: unknown): StreamItem | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const source = typeof v.source === "object" && v.source !== null ? (v.source as Record<string, unknown>) : null;
  if (typeof v.id !== "string" || !v.id) return null;
  if (typeof v.title !== "string" || !v.title.trim()) return null;
  if (!isHttps(v.url)) return null;
  if (typeof v.published !== "string" || !DATE.test(v.published)) return null;
  if (!source) return null;
  if (typeof source.kind !== "string" || !(STREAM_SOURCE_KINDS as readonly string[]).includes(source.kind)) return null;
  if (typeof source.name !== "string" || !source.name.trim()) return null;

  const links = typeof v.links === "object" && v.links !== null ? (v.links as Record<string, unknown>) : undefined;
  const platform = (key: string): string | undefined =>
    links && isHttps(links[key]) ? (links[key] as string) : undefined;

  return {
    id: v.id,
    title: v.title.trim(),
    url: v.url,
    source: {
      kind: source.kind as StreamSourceKind,
      name: source.name.trim(),
      ...(isHttps(source.feed) ? { feed: source.feed } : {}),
    },
    published: v.published,
    ...(typeof v.author === "string" && v.author.trim() ? { author: v.author.trim() } : {}),
    ...(typeof v.summary === "string" && v.summary.trim() ? { summary: v.summary.trim() } : {}),
    ...(typeof v.weight === "number" && Number.isFinite(v.weight) ? { weight: v.weight } : {}),
    ...(typeof v.show === "string" && v.show.trim() ? { show: v.show.trim() } : {}),
    ...(typeof v.durationSec === "number" && Number.isFinite(v.durationSec) && v.durationSec > 0
      ? { durationSec: Math.round(v.durationSec) }
      : {}),
    ...(links
      ? {
          links: {
            ...(platform("youtube") ? { youtube: platform("youtube") } : {}),
            ...(platform("spotify") ? { spotify: platform("spotify") } : {}),
            ...(platform("apple") ? { apple: platform("apple") } : {}),
            ...(platform("rss") ? { rss: platform("rss") } : {}),
          },
        }
      : {}),
  };
}

function dataDir(): string {
  return path.join(process.cwd(), "data");
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Newest first, deduplicated by id. Never throws. */
export function loadStream(stream: StreamName, dir = dataDir()): StreamItem[] {
  const parsed = readJson(path.join(dir, FILES[stream]));
  if (typeof parsed !== "object" || parsed === null) return [];
  const file = parsed as Record<string, unknown>;
  if (file.schemaVersion !== "boardless-stream/1") return [];
  if (!Array.isArray(file.items)) return [];

  const seen = new Set<string>();
  const items: StreamItem[] = [];
  for (const raw of file.items) {
    const item = parseStreamItem(raw);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items.sort((a, b) => (b.published.localeCompare(a.published) || a.title.localeCompare(b.title)));
}

/** Newest day first; the UI renders one heading per day. */
export function groupStreamByDay(items: StreamItem[]): Array<{ date: string; items: StreamItem[] }> {
  const days = new Map<string, StreamItem[]>();
  for (const item of items) {
    const list = days.get(item.published);
    if (list) list.push(item);
    else days.set(item.published, [item]);
  }
  return [...days.entries()]
    .map(([date, list]) => ({ date, items: list }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * „před 4 h" / „včera" / „před 3 dny", and an absolute Czech date past a week.
 * `anchor` is the newest edition's date, never a clock.
 */
export function czechRelativeDate(published: string, anchor: string, absolute: (d: string) => string): string {
  const toDays = (value: string): number => {
    const [y, m, d] = value.split("-").map(Number);
    return Math.round(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1) / 86_400_000);
  };
  const delta = toDays(anchor) - toDays(published);
  if (delta <= 0) return "dnes";
  if (delta === 1) return "včera";
  if (delta < 5) return `před ${delta} dny`;
  if (delta <= 7) return `před ${delta} dny`;
  return absolute(published);
}

/** An episode length as Czech text. Unknown length renders nothing at all. */
export function czechDuration(seconds: number | undefined): string | null {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds / 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
