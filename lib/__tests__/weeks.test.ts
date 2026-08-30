import { describe, expect, it } from "vitest";
import {
  addDays,
  czechDisplayDate,
  czechNumericDate,
  czechWeekday,
  groupByDay,
  groupByWeek,
  isWeekId,
  isoWeekday,
  previousWeek,
  weekIdOf,
  weekOf,
  weekRangeLabel,
  weekTitle,
  weekBeforeWindow,
  withinLastDays,
} from "../weeks";
import type { ArticleSummary } from "../content";

const article = (date: string, slug = date): ArticleSummary => ({
  slug,
  date,
  title: `Edition ${date}`,
});

describe("iso weekday", () => {
  it("counts Monday as 1 and Sunday as 7", () => {
    expect(isoWeekday("2026-08-03")).toBe(1); // Monday
    expect(isoWeekday("2026-08-07")).toBe(5); // Friday
    expect(isoWeekday("2026-08-09")).toBe(7); // Sunday
  });
});

describe("date arithmetic", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("handles leap days in both directions", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("round-trips a long span", () => {
    expect(addDays(addDays("2026-08-09", 400), -400)).toBe("2026-08-09");
  });
});

describe("week ids", () => {
  it("labels a mid-year week", () => {
    expect(weekIdOf("2026-08-09")).toBe("2026-w32");
    expect(weekIdOf("2026-08-03")).toBe("2026-w32");
  });

  it("puts a Monday and the following Sunday in the same week", () => {
    expect(weekIdOf("2026-08-03")).toBe(weekIdOf("2026-08-09"));
  });

  it("assigns an early January date to the previous ISO year when the week belongs there", () => {
    // 2027-01-01 is a Friday, so its ISO week is 2026-w53.
    expect(weekIdOf("2027-01-01")).toBe("2026-w53");
    // 2026-01-01 is a Thursday, so its own week is week 1.
    expect(weekIdOf("2026-01-01")).toBe("2026-w01");
  });

  it("produces ids the route matcher accepts", () => {
    for (const date of ["2026-01-01", "2026-08-09", "2027-01-01", "2028-02-29"]) {
      expect(isWeekId(weekIdOf(date))).toBe(true);
    }
    expect(isWeekId("2026-w1")).toBe(false);
    expect(isWeekId("not-a-week")).toBe(false);
  });
});

describe("week boundaries", () => {
  it("spans Monday to Sunday", () => {
    const week = weekOf("2026-08-09");
    expect(week.start).toBe("2026-08-03");
    expect(week.end).toBe("2026-08-09");
  });

  it("steps back exactly one week", () => {
    expect(previousWeek("2026-08-09").id).toBe("2026-w31");
    expect(previousWeek("2026-08-09").start).toBe("2026-07-27");
  });
});

describe("czech labels", () => {
  it("writes a range with an en-dash and one year", () => {
    expect(weekRangeLabel(weekOf("2026-08-02"))).toBe("27. 7. – 2. 8. 2026");
  });

  it("repeats the year when the range crosses one", () => {
    expect(weekRangeLabel(weekOf("2027-01-01"))).toBe("28. 12. 2026 – 3. 1. 2027");
  });

  it("titles a week", () => {
    expect(weekTitle(weekOf("2026-08-02"))).toBe("Týden 27. 7. – 2. 8. 2026");
  });

  it("never emits an em-dash", () => {
    const samples = [
      weekRangeLabel(weekOf("2026-08-02")),
      weekTitle(weekOf("2027-01-01")),
      czechNumericDate("2026-08-09"),
      czechWeekday("2026-08-07"),
    ];
    for (const sample of samples) expect(sample).not.toContain("—");
  });

  it("names weekdays in Czech", () => {
    expect(czechWeekday("2026-08-07")).toBe("pátek");
    expect(czechWeekday("2026-08-03")).toBe("pondělí");
  });

  it("reformats only bare date keys for display", () => {
    expect(czechDisplayDate("2026-08-17")).toBe("17. 8. 2026");
    // Composed labels and non-key data pass through untouched.
    expect(czechDisplayDate("2026-05-10 → 2026-05-12")).toBe("2026-05-10 → 2026-05-12");
    expect(czechDisplayDate("")).toBe("");
    expect(czechDisplayDate("2026-08-17T03:09:28Z")).toBe("2026-08-17T03:09:28Z");
  });
});

describe("grouping", () => {
  const articles = [
    article("2026-08-09"),
    article("2026-08-07"),
    article("2026-08-03"),
    article("2026-07-31"),
  ];

  it("keeps the last seven days inclusive of the anchor", () => {
    const recent = withinLastDays(articles, "2026-08-09", 7);
    expect(recent.map((a) => a.date)).toEqual(["2026-08-09", "2026-08-07", "2026-08-03"]);
  });

  it("returns nothing for an anchor before every edition", () => {
    expect(withinLastDays(articles, "2020-01-01", 7)).toEqual([]);
  });

  it("groups by ISO week, newest first", () => {
    const weeks = groupByWeek(articles);
    expect(weeks.map((w) => w.id)).toEqual(["2026-w32", "2026-w31"]);
    expect(weeks[0]?.articles).toHaveLength(3);
    expect(weeks[1]?.articles).toHaveLength(1);
  });

  it("groups by day, newest first", () => {
    const days = groupByDay([article("2026-08-07", "a"), article("2026-08-09", "b"), article("2026-08-07", "c")]);
    expect(days.map((d) => d.date)).toEqual(["2026-08-09", "2026-08-07"]);
    expect(days[1]?.articles).toHaveLength(2);
  });

  it("handles an empty archive", () => {
    expect(groupByWeek([])).toEqual([]);
    expect(groupByDay([])).toEqual([]);
    expect(withinLastDays([], "2026-08-09", 7)).toEqual([]);
  });
});

describe("the week chain never points at a page that was not built", () => {
  it("skips a quiet week and lands on one that has an edition", () => {
    // Nothing published in w31; the action must jump past it to w30.
    const articles = [article("2026-08-07"), article("2026-08-03"), article("2026-07-22")];
    const older = weekBeforeWindow(articles, "2026-08-09");
    expect(older?.id).toBe("2026-w30");
    expect(older?.articles.map((a) => a.date)).toEqual(["2026-07-22"]);
  });

  it("returns null when the window already covers the whole archive", () => {
    expect(weekBeforeWindow([article("2026-08-07")], "2026-08-09")).toBeNull();
    expect(weekBeforeWindow([], "2026-08-09")).toBeNull();
  });

  it("never returns a week that overlaps the window", () => {
    const articles = [article("2026-08-09"), article("2026-08-04"), article("2026-07-30")];
    const older = weekBeforeWindow(articles, "2026-08-09");
    // The window opens on 2026-08-03, so the chosen week must end before it.
    expect(older && older.end < "2026-08-03").toBe(true);
  });

  it("agrees with the pages generateStaticParams would build", () => {
    const articles = [article("2026-08-09"), article("2026-07-22"), article("2026-06-10")];
    const built = new Set(groupByWeek(articles).map((w) => w.id));
    const older = weekBeforeWindow(articles, "2026-08-09");
    expect(older).not.toBeNull();
    expect(built.has(older!.id)).toBe(true);
  });
});
