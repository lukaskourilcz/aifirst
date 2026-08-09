// ISO week arithmetic for the /tyden chain.
//
// Same rule as lib/daily.ts: nothing here reads a clock. Every function takes
// YYYY-MM-DD calendar keys and does integer arithmetic on them, so the same
// content always produces the same week pages. The "today" anchor is always the
// newest edition's frontmatter.date, passed in by the caller.

import type { ArticleSummary } from "./content";

export type WeekId = `${number}-w${number}` | string;

export type Week = {
  /** `2026-w32` — ISO year and ISO week, zero-padded. */
  id: WeekId;
  /** Monday, YYYY-MM-DD. */
  start: string;
  /** Sunday, YYYY-MM-DD. */
  end: string;
};

export type WeekGroup = Week & { articles: ArticleSummary[] };

function parts(dateKey: string): [number, number, number] {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined || Number.isNaN(y + m + d)) {
    throw new Error(`invalid date key: ${dateKey}`);
  }
  return [y, m, d];
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

function toDayNumber(dateKey: string): number {
  const [y, m, d] = parts(dateKey);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * Days-since-epoch back to a calendar date, by integer arithmetic. Same reason
 * lib/daily.ts hand-rolls its own: this path never constructs a Date, so there
 * is no way for a clock or a local timezone to reach the build.
 */
function fromDayNumber(days: number): string {
  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** Monday = 1 … Sunday = 7, matching ISO 8601. */
export function isoWeekday(dateKey: string): number {
  // 1970-01-01 was a Thursday, so day number 0 is weekday 4.
  return ((toDayNumber(dateKey) + 3) % 7) + 1;
}

export function addDays(dateKey: string, delta: number): string {
  return fromDayNumber(toDayNumber(dateKey) + delta);
}

/** The Monday of the ISO week containing `dateKey`. */
export function weekStart(dateKey: string): string {
  return addDays(dateKey, 1 - isoWeekday(dateKey));
}

/**
 * The ISO week id. The ISO year is the year of that week's Thursday, which is
 * why a 1 January can belong to the previous year's week 52 or 53.
 */
export function weekIdOf(dateKey: string): WeekId {
  const monday = weekStart(dateKey);
  const thursday = addDays(monday, 3);
  const [isoYear] = parts(thursday);
  const firstThursday = (() => {
    // Week 1 is the week containing the first Thursday of the ISO year.
    const jan4 = `${pad(isoYear, 4)}-01-04`;
    return addDays(weekStart(jan4), 3);
  })();
  const week = Math.round((toDayNumber(thursday) - toDayNumber(firstThursday)) / 7) + 1;
  return `${pad(isoYear, 4)}-w${pad(week)}`;
}

export function weekOf(dateKey: string): Week {
  const start = weekStart(dateKey);
  return { id: weekIdOf(dateKey), start, end: addDays(start, 6) };
}

/** The week immediately before the one containing `dateKey`. */
export function previousWeek(dateKey: string): Week {
  return weekOf(addDays(weekStart(dateKey), -7));
}

export function isWeekId(value: string): boolean {
  return /^\d{4}-w\d{2}$/.test(value);
}

const CS_MONTHS_GENITIVE = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
] as const;

/**
 * „28. 7. – 3. 8. 2026" — Czech numeric range with an en-dash and no em-dash
 * anywhere. The year appears once, on the end date, unless the range crosses a
 * year boundary.
 */
export function weekRangeLabel(week: Week): string {
  const [sy, sm, sd] = parts(week.start);
  const [ey, em, ed] = parts(week.end);
  const left = sy === ey ? `${sd}. ${sm}.` : `${sd}. ${sm}. ${sy}`;
  return `${left} – ${ed}. ${em}. ${ey}`;
}

/** „Týden 28. 7. – 3. 8. 2026". */
export function weekTitle(week: Week): string {
  return `Týden ${weekRangeLabel(week)}`;
}

/** „3. srpna 2026" — long Czech form, for a single day label. */
export function czechLongDate(dateKey: string): string {
  const [y, m, d] = parts(dateKey);
  const month = CS_MONTHS_GENITIVE[m - 1] ?? String(m);
  return `${d}. ${month} ${y}`;
}

const CS_WEEKDAYS = ["pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "neděle"] as const;

/** „PÁTEK · 8. 8. 2026" is built from these two halves by the caller. */
export function czechWeekday(dateKey: string): string {
  return CS_WEEKDAYS[isoWeekday(dateKey) - 1] ?? "";
}

export function czechNumericDate(dateKey: string): string {
  const [y, m, d] = parts(dateKey);
  return `${d}. ${m}. ${y}`;
}

/**
 * The last `days` publishing days up to and including `anchor`. Calendar days,
 * not editions: a week with a no-edition day still ends at the same boundary.
 */
export function withinLastDays(articles: ArticleSummary[], anchor: string, days: number): ArticleSummary[] {
  const floor = addDays(anchor, -(days - 1));
  return articles.filter((a) => a.date >= floor && a.date <= anchor);
}

/** Every week that has at least one edition, newest first. */
export function groupByWeek(articles: ArticleSummary[]): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();
  for (const article of articles) {
    const week = weekOf(article.date);
    const existing = groups.get(week.id);
    if (existing) existing.articles.push(article);
    else groups.set(week.id, { ...week, articles: [article] });
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      articles: [...group.articles].sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.start.localeCompare(a.start));
}

/** Editions grouped by day inside one week, newest day first. */
export function groupByDay(articles: ArticleSummary[]): Array<{ date: string; articles: ArticleSummary[] }> {
  const days = new Map<string, ArticleSummary[]>();
  for (const article of articles) {
    const list = days.get(article.date);
    if (list) list.push(article);
    else days.set(article.date, [article]);
  }
  return [...days.entries()]
    .map(([date, list]) => ({ date, articles: list }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * The newest week that lies entirely before the last-`days` window, and that
 * actually has an edition.
 *
 * The chain must never point at a page `generateStaticParams` did not build,
 * so this picks from real week groups rather than doing anchor-minus-seven
 * arithmetic: a quiet week has no page, and the action has to skip it.
 */
export function weekBeforeWindow(
  articles: ArticleSummary[],
  anchor: string,
  days = 7,
): WeekGroup | null {
  const windowStart = addDays(anchor, -(days - 1));
  return groupByWeek(articles).find((group) => group.end < windowStart) ?? null;
}
