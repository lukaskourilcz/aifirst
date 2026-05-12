import type { ArticleSummary } from "./content.js";

export type TagMonthCell = {
  tag: string;
  month: string;
  count: number;
};

export type TrendsMatrix = {
  months: string[];
  tags: string[];
  cells: TagMonthCell[];
  byMonthTotals: number[];
};

export function buildTrends(
  articles: ArticleSummary[],
  topN = 8,
): TrendsMatrix {
  const monthSet = new Set<string>();
  const tagTotals = new Map<string, number>();
  const counts = new Map<string, number>(); // key: `${tag}|${month}`

  for (const a of articles) {
    const month = a.date.slice(0, 7);
    monthSet.add(month);
    for (const tag of a.tags ?? []) {
      tagTotals.set(tag, (tagTotals.get(tag) ?? 0) + 1);
      const key = `${tag}|${month}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const months = [...monthSet].sort();
  const tags = [...tagTotals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, topN)
    .map(([t]) => t);

  const cells: TagMonthCell[] = [];
  const byMonthTotals = months.map(() => 0);
  for (const tag of tags) {
    months.forEach((month, idx) => {
      const count = counts.get(`${tag}|${month}`) ?? 0;
      cells.push({ tag, month, count });
      byMonthTotals[idx] = (byMonthTotals[idx] ?? 0) + count;
    });
  }

  return { months, tags, cells, byMonthTotals };
}
