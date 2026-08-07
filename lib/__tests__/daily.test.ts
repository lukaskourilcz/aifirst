import { describe, it, expect } from "vitest";
import {
  dailyIndex,
  daysBetween,
  effectiveDateKey,
  revealDate,
  revealedCount,
} from "../daily.js";

const ANCHOR = "2026-07-01";

describe("daysBetween", () => {
  it("is zero at the anchor", () => {
    expect(daysBetween(ANCHOR, ANCHOR)).toBe(0);
  });

  it("counts forward across a month boundary", () => {
    // July has 31 days, so 1 July → 7 August is 31 + 6.
    expect(daysBetween(ANCHOR, "2026-08-07")).toBe(37);
  });

  it("counts across a year boundary", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });

  it("counts across a leap day", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
  });

  it("is negative before the anchor", () => {
    expect(daysBetween(ANCHOR, "2026-06-30")).toBe(-1);
  });

  it("throws on a malformed date key", () => {
    expect(() => daysBetween(ANCHOR, "2026-07")).toThrow(/invalid date key/);
    expect(() => daysBetween("", ANCHOR)).toThrow(/invalid date key/);
  });
});

describe("effectiveDateKey", () => {
  it("keeps a date on or after the anchor", () => {
    expect(effectiveDateKey(ANCHOR, "2026-08-07")).toBe("2026-08-07");
    expect(effectiveDateKey(ANCHOR, ANCHOR)).toBe(ANCHOR);
  });

  it("clamps a pre-anchor date to the anchor", () => {
    expect(effectiveDateKey(ANCHOR, "2026-01-01")).toBe(ANCHOR);
  });

  it("clamps a missing date to the anchor", () => {
    expect(effectiveDateKey(ANCHOR, undefined)).toBe(ANCHOR);
  });
});

describe("dailyIndex", () => {
  it("starts at zero on the anchor", () => {
    expect(dailyIndex(ANCHOR, ANCHOR, 50)).toBe(0);
  });

  it("gives consecutive indices for consecutive dates", () => {
    expect(dailyIndex(ANCHOR, "2026-08-07", 50)).toBe(37);
    expect(dailyIndex(ANCHOR, "2026-08-07", 50) + 1).toBe(
      dailyIndex(ANCHOR, "2026-08-08", 50),
    );
  });

  it("wraps back to zero after a full cycle", () => {
    expect(daysBetween(ANCHOR, "2026-08-20")).toBe(50);
    expect(dailyIndex(ANCHOR, "2026-08-20", 50)).toBe(0);
  });

  it("stays in range for a pre-anchor date", () => {
    const index = dailyIndex(ANCHOR, "2026-06-01", 50);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(50);
  });

  it("is stable: the same date always yields the same index", () => {
    expect(dailyIndex(ANCHOR, "2026-09-14", 60)).toBe(dailyIndex(ANCHOR, "2026-09-14", 60));
  });

  it("throws on an empty dataset", () => {
    expect(() => dailyIndex(ANCHOR, ANCHOR, 0)).toThrow(/non-empty dataset/);
  });
});

describe("revealedCount", () => {
  it("reveals exactly one entry on the anchor", () => {
    expect(revealedCount(ANCHOR, ANCHOR, 60)).toBe(1);
  });

  it("grows by one a day", () => {
    expect(revealedCount(ANCHOR, "2026-08-07", 60)).toBe(38);
  });

  it("clamps to the dataset length once every entry is out", () => {
    expect(revealedCount(ANCHOR, "2030-01-01", 60)).toBe(60);
  });

  it("never drops below one, even before the anchor", () => {
    expect(revealedCount(ANCHOR, "2020-01-01", 60)).toBe(1);
  });

  it("throws on an empty dataset", () => {
    expect(() => revealedCount(ANCHOR, ANCHOR, 0)).toThrow(/non-empty dataset/);
  });
});

describe("revealDate", () => {
  it("returns the anchor for index zero", () => {
    expect(revealDate(ANCHOR, 0)).toBe(ANCHOR);
  });

  it("walks across month boundaries", () => {
    expect(revealDate(ANCHOR, 30)).toBe("2026-07-31");
    expect(revealDate(ANCHOR, 31)).toBe("2026-08-01");
    expect(revealDate(ANCHOR, 59)).toBe("2026-08-29");
  });

  it("walks across a year boundary", () => {
    expect(revealDate("2026-12-30", 2)).toBe("2027-01-01");
  });

  it("handles leap and non-leap Februaries", () => {
    expect(revealDate("2028-02-28", 1)).toBe("2028-02-29");
    expect(revealDate("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("round-trips with daysBetween", () => {
    for (const index of [0, 1, 17, 44, 59]) {
      expect(daysBetween(ANCHOR, revealDate(ANCHOR, index))).toBe(index);
    }
  });
});
