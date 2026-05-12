import type { Source } from "../scraping/types.js";

export type SignalInputs = {
  cited: Array<{ id: string }>;
  registry: Source[];
};

export function computeSignalStrength({ cited, registry }: SignalInputs): number {
  if (cited.length === 0) return 0;

  const byId = new Map(registry.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const weights: number[] = [];
  for (const c of cited) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    const src = byId.get(c.id);
    weights.push(src?.weight ?? 0.5);
  }

  const diversity = Math.min(100, seen.size * 22);
  const meanWeight =
    weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
  const quality = Math.min(100, meanWeight * 110);

  return Math.round((diversity + quality) / 2);
}
