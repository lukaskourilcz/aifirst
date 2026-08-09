import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  czechDuration,
  czechRelativeDate,
  groupStreamByDay,
  loadStream,
  parseStreamItem,
  STREAM_NAMES,
} from "../streams";
import {
  byScope,
  eventDateBlock,
  eventPlace,
  loadEvents,
  parseEvent,
  splitByAnchor,
} from "../events";

const DATA = path.join(process.cwd(), "data");
const MISSING = path.join(process.cwd(), "data", "__does_not_exist__");

const item = (over: Record<string, unknown> = {}) => ({
  id: "abc123",
  title: "The Hidden Cost of Long Context Windows",
  url: "https://example.com/post",
  source: { kind: "substack", name: "Interconnects" },
  published: "2026-08-08",
  ...over,
});

const event = (over: Record<string, unknown> = {}) => ({
  id: "ml-prague-2026",
  scope: "cz",
  title: "Machine Learning Prague 2026",
  starts: "2026-10-14",
  url: "https://mlprague.com",
  online: false,
  ...over,
});

describe("the shipped files are valid empty envelopes", () => {
  it("carries the stream contract with an items array", () => {
    for (const stream of STREAM_NAMES) {
      const file = JSON.parse(fs.readFileSync(path.join(DATA, `${stream}.json`), "utf8"));
      expect(file.schemaVersion).toBe("boardless-stream/1");
      expect(file.stream).toBe(stream);
      expect(Array.isArray(file.items)).toBe(true);
      // Minimum of zero on purpose: a delivery must never require a test edit.
      expect(file.items.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("carries the events contract with an events array", () => {
    const file = JSON.parse(fs.readFileSync(path.join(DATA, "events.json"), "utf8"));
    expect(file.schemaVersion).toBe("boardless-events/1");
    expect(Array.isArray(file.events)).toBe(true);
    expect(file.events.length).toBeGreaterThanOrEqual(0);
  });

  it("loads them without throwing", () => {
    for (const stream of STREAM_NAMES) expect(loadStream(stream)).toEqual([]);
    expect(loadEvents()).toEqual([]);
  });
});

describe("a bad file costs a section, not a build", () => {
  it("returns empty for a missing directory", () => {
    expect(loadStream("podcasts", MISSING)).toEqual([]);
    expect(loadEvents(MISSING)).toEqual([]);
  });
});

describe("stream item validation", () => {
  it("accepts a complete item", () => {
    const parsed = parseStreamItem(item());
    expect(parsed?.id).toBe("abc123");
    expect(parsed?.source.kind).toBe("substack");
  });

  it("drops an item missing a field the UI renders", () => {
    expect(parseStreamItem(item({ title: "  " }))).toBeNull();
    expect(parseStreamItem(item({ id: "" }))).toBeNull();
    expect(parseStreamItem(item({ published: "8. 8. 2026" }))).toBeNull();
    expect(parseStreamItem(item({ source: { kind: "carrier-pigeon", name: "x" } }))).toBeNull();
    expect(parseStreamItem(item({ source: null }))).toBeNull();
  });

  it("refuses a non-https destination", () => {
    expect(parseStreamItem(item({ url: "http://example.com" }))).toBeNull();
    expect(parseStreamItem(item({ url: "javascript:alert(1)" }))).toBeNull();
  });

  it("keeps podcast extras and drops unusable ones", () => {
    const parsed = parseStreamItem(
      item({ show: "Latent Space", durationSec: 4320, links: { spotify: "https://open.spotify.com/x", apple: "http://insecure" } }),
    );
    expect(parsed?.show).toBe("Latent Space");
    expect(parsed?.durationSec).toBe(4320);
    expect(parsed?.links?.spotify).toBe("https://open.spotify.com/x");
    expect(parsed?.links?.apple).toBeUndefined();
  });
});

describe("stream ordering and grouping", () => {
  it("sorts newest first and dedupes by id", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dneskai-stream-"));
    try {
      fs.writeFileSync(
        path.join(dir, "podcasts.json"),
        JSON.stringify({
          schemaVersion: "boardless-stream/1",
          stream: "podcasts",
          updated: "2026-08-09",
          windowDays: 60,
          items: [
            item({ id: "a", published: "2026-08-01" }),
            item({ id: "b", published: "2026-08-09" }),
            item({ id: "a", published: "2026-08-01" }),
            { id: "broken" },
          ],
        }),
      );
      const items = loadStream("podcasts", dir);
      expect(items.map((i) => i.id)).toEqual(["b", "a"]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("groups by day, newest day first", () => {
    const groups = groupStreamByDay([
      parseStreamItem(item({ id: "1", published: "2026-08-07" }))!,
      parseStreamItem(item({ id: "2", published: "2026-08-09" }))!,
      parseStreamItem(item({ id: "3", published: "2026-08-07" }))!,
    ]);
    expect(groups.map((g) => g.date)).toEqual(["2026-08-09", "2026-08-07"]);
    expect(groups[1]?.items).toHaveLength(2);
  });
});

describe("czech stream formatting", () => {
  const absolute = (d: string) => `abs:${d}`;

  it("reads relative dates against the anchor, never a clock", () => {
    expect(czechRelativeDate("2026-08-09", "2026-08-09", absolute)).toBe("dnes");
    expect(czechRelativeDate("2026-08-08", "2026-08-09", absolute)).toBe("včera");
    expect(czechRelativeDate("2026-08-06", "2026-08-09", absolute)).toBe("před 3 dny");
    expect(czechRelativeDate("2026-08-01", "2026-08-09", absolute)).toBe("abs:2026-08-01");
  });

  it("omits an unknown duration entirely", () => {
    expect(czechDuration(undefined)).toBeNull();
    expect(czechDuration(0)).toBeNull();
    expect(czechDuration(-5)).toBeNull();
  });

  it("writes a known duration in Czech", () => {
    expect(czechDuration(4320)).toBe("1 h 12 min");
    expect(czechDuration(1800)).toBe("30 min");
    expect(czechDuration(7200)).toBe("2 h");
  });
});

describe("event validation", () => {
  it("accepts a complete event", () => {
    expect(parseEvent(event())?.title).toBe("Machine Learning Prague 2026");
  });

  it("rejects an unknown scope and a bad date", () => {
    expect(parseEvent(event({ scope: "moon" }))).toBeNull();
    expect(parseEvent(event({ starts: "14. 10. 2026" }))).toBeNull();
  });

  it("rejects an end before the start", () => {
    expect(parseEvent(event({ ends: "2026-10-13" }))).toBeNull();
    expect(parseEvent(event({ ends: "2026-10-16" }))?.ends).toBe("2026-10-16");
  });

  it("rejects a non-https url and an over-long title", () => {
    expect(parseEvent(event({ url: "http://mlprague.com" }))).toBeNull();
    expect(parseEvent(event({ title: "x".repeat(121) }))).toBeNull();
    expect(parseEvent(event({ title: "x".repeat(120) }))).not.toBeNull();
  });

  it("caps the description at 280 characters", () => {
    expect(parseEvent(event({ description: "x".repeat(281) }))?.description).toBeUndefined();
    expect(parseEvent(event({ description: "x".repeat(280) }))?.description).toHaveLength(280);
  });
});

describe("event splitting", () => {
  const events = [
    parseEvent(event({ id: "past", starts: "2026-06-01" }))!,
    parseEvent(event({ id: "today", starts: "2026-08-09" }))!,
    parseEvent(event({ id: "soon", starts: "2026-09-12" }))!,
    parseEvent(event({ id: "spanning", starts: "2026-08-07", ends: "2026-08-11" }))!,
    parseEvent(event({ id: "world", scope: "global", starts: "2026-10-01" }))!,
  ];

  it("splits against the anchor with upcoming ascending", () => {
    const { upcoming, past } = splitByAnchor(events, "2026-08-09");
    expect(upcoming.map((e) => e.id)).toEqual(["spanning", "today", "soon", "world"]);
    expect(past.map((e) => e.id)).toEqual(["past"]);
  });

  it("keeps a multi-day event upcoming through its middle days", () => {
    const { upcoming } = splitByAnchor(events, "2026-08-10");
    expect(upcoming.map((e) => e.id)).toContain("spanning");
  });

  it("filters by scope", () => {
    expect(byScope(events, "global").map((e) => e.id)).toEqual(["world"]);
    expect(byScope(events, "cz")).toHaveLength(4);
  });
});

describe("event presentation", () => {
  it("builds the Czech date block", () => {
    expect(eventDateBlock("2026-10-14")).toEqual({ day: "14", month: "ŘÍJ" });
    expect(eventDateBlock("2026-01-02")).toEqual({ day: "2", month: "LED" });
  });

  it("describes the place, or says online, or says nothing", () => {
    expect(eventPlace(parseEvent(event({ city: "Praha", venue: "Fórum Karlín" }))!)).toBe("Praha · Fórum Karlín");
    expect(eventPlace(parseEvent(event({ online: true }))!)).toBe("online");
    expect(eventPlace(parseEvent(event())!)).toBeNull();
  });
});
