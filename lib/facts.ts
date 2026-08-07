import raw from "@/data/ai-facts.json";
import {
  type DatasetEntry,
  type DatasetFile,
  dailyIndex,
  effectiveDateKey,
} from "./daily";

// Parsed once at module scope. This is a build-time read surface for the Today
// page and is deliberately separate from the edition pipeline — it never
// touches `lib/content.ts` or `lib/delivery/`.
const facts = raw as DatasetFile;

export function loadAiFacts(): DatasetFile {
  return facts;
}

/**
 * The fact belonging to a publication date. Missing or pre-anchor dates clamp
 * to the anchor, so the returned `dateKey` is the one the pick actually used.
 */
export function factOfTheDay(dateKey: string | undefined): {
  entry: DatasetEntry;
  dateKey: string;
} {
  const resolved = effectiveDateKey(facts.anchor, dateKey);
  const entry = facts.entries[dailyIndex(facts.anchor, resolved, facts.entries.length)];
  if (entry === undefined) throw new Error("ai-facts.json has no entries");
  return { entry, dateKey: resolved };
}
