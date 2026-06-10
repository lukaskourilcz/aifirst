// Date helpers shared by the generation scripts and content sorting.

// YYYY-MM-DD in UTC. Defaults to now; pass a Date to format a specific day.
export function toIsoDate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return toIsoDate();
}

// Comparator that sorts records newest-first by their `date` field.
export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}
