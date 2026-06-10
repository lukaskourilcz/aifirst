// Collect items into a Map keyed by a derived value, preserving
// insertion order within each bucket. Replaces the hand-rolled
// `map.get(key) ?? []; bucket.push(...)` idiom used across pages.
export function groupBy<T, K>(
  items: Iterable<T>,
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}
