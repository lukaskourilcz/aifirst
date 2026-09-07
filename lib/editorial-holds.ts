import holds from "@/config/editorial-holds.json";

type EditorialHold = { date: string; reason: string; issue: string };
/** A reader-side correction record; original delivered content and hashes stay intact. */
export function editorialHold(slug: string): EditorialHold | undefined {
  return Object.hasOwn(holds, slug) ? (holds as Record<string, EditorialHold>)[slug] : undefined;
}
export function heldArticleSlugs(): string[] { return Object.keys(holds); }
