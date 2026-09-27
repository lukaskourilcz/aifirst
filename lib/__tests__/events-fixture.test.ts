// /akce against a populated file. `data/events.json` is BoardlessAI's to sync
// wholesale (docs/GOVERNANCE.md) and ships empty here, so the populated case is
// proven on a fixture: a realistic October 2026 programme in the
// `boardless-events/1` shape, with a past event, two world events, a duplicate
// id and an invalid http:// link that must be dropped. The fixture's links are
// test data, not a curated list.
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  byScope,
  eventBadges,
  eventDateLabel,
  eventPlace,
  eventSource,
  isFreeEvent,
  loadEvents,
  splitByAnchor,
} from "../events";

const FIXTURE = path.join(process.cwd(), "lib", "__tests__", "fixtures", "events");

describe("a populated events file", () => {
  const events = loadEvents(FIXTURE);
  // The newest edition's date is the anchor, never a clock.
  const { upcoming, past } = splitByAnchor(events, "2026-10-01");

  it("loads every valid event once and drops the invalid ones", () => {
    expect(events).toHaveLength(25);
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
    expect(events.find((e) => e.id === "broken")).toBeUndefined();
  });

  it("lists at least twenty dated October events in Czechia, in date order", () => {
    const october = byScope(upcoming, "cz").filter((e) => e.starts.startsWith("2026-10"));
    expect(october.length).toBeGreaterThanOrEqual(20);
    const starts = byScope(upcoming, "cz").map((e) => e.starts);
    expect(starts).toEqual([...starts].sort());
    expect(byScope(upcoming, "global").map((e) => e.id)).toEqual(["online-only-global", "neurips-2026-fixture"]);
  });

  it("hides past events from the upcoming list", () => {
    expect(past.map((e) => e.id)).toEqual(["ml-prague-2026-fixture"]);
    expect(upcoming.some((e) => e.id === "ml-prague-2026-fixture")).toBe(false);
  });

  it("keeps a running multi-day event upcoming until its last day", () => {
    const midHackathon = splitByAnchor(events, "2026-10-09");
    expect(midHackathon.upcoming.some((e) => e.id === "from-dusk-till-dawn-hackathon")).toBe(true);
    expect(splitByAnchor(events, "2026-10-10").past.some((e) => e.id === "from-dusk-till-dawn-hackathon")).toBe(true);
  });

  it("gives every upcoming event a Czech date and an https source link", () => {
    for (const event of upcoming) {
      expect(eventDateLabel(event)).toMatch(/^\d{1,2}\./);
      expect(eventDateLabel(event)).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(event.url.startsWith("https://")).toBe(true);
      expect(eventSource(event)).not.toBe("");
    }
  });

  it("badges online and free events and keeps real prices as text", () => {
    const byId = new Map(events.map((e) => [e.id, e]));
    expect(eventBadges(byId.get("mesic-ai-tiskova-konference")!)).toEqual(["online", "free"]);
    expect(eventBadges(byId.get("digitalni-garaz-google")!)).toEqual(["online", "free"]);
    expect(eventBadges(byId.get("ai-ve-zdravotnictvi")!)).toEqual([]);
    expect(isFreeEvent(byId.get("devfest-cz-2026")!)).toBe(false);
    expect(eventBadges(byId.get("online-only-global")!)).toEqual(["online", "free"]);
    expect(eventPlace(byId.get("online-only-global")!)).toBeNull();
    // Unknown price: no badge, nothing guessed.
    expect(eventBadges(byId.get("ai-tinkerers-prague-oct")!)).toEqual([]);
    expect(byId.get("ai-tinkerers-prague-oct")!.price).toBeUndefined();
  });
});

describe("the Czech date line", () => {
  it("formats single days and ranges", () => {
    expect(eventDateLabel({ starts: "2026-10-14" })).toBe("14. října 2026");
    expect(eventDateLabel({ starts: "2026-10-16", ends: "2026-10-18" })).toBe("16.–18. října 2026");
    expect(eventDateLabel({ starts: "2026-09-30", ends: "2026-10-02" })).toBe("30. září – 2. října 2026");
    expect(eventDateLabel({ starts: "2026-12-30", ends: "2027-01-02" })).toBe("30. prosince 2026 – 2. ledna 2027");
    expect(eventDateLabel({ starts: "2026-10-14", ends: "2026-10-14" })).toBe("14. října 2026");
  });

  it("treats only an outright free price as free", () => {
    for (const price of ["zdarma", "Zdarma", "vstup zdarma", "Free", "0 Kč"]) expect(isFreeEvent({ price })).toBe(true);
    for (const price of ["zdarma pro členy, jinak 490 Kč", "490 Kč", undefined, null]) expect(isFreeEvent({ price })).toBe(false);
  });
});
