import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { boardChangelogErrors, boardContextErrors, homeEditionState, isPublishingDay, listBoardContexts, loadBoardChangelog, parseBoardContext, readBoardContext } from "../board";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true }))));

async function tempDir() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "aifirst-board-"));
  roots.push(root);
  return root;
}

const edition = {
  schemaVersion: "board-context/1",
  date: "2026-08-04",
  packageHash: "a".repeat(64),
  status: "edition",
  whyThisStory: "The verified change affects production budgets.",
  roomUrl: "https://boardless.example/meetings/2026-08-04-cu-edition",
  generationCostUsd: 0.194,
};

describe("board context", () => {
  it("accepts sanitized edition data and unknown additive fields", () => {
    expect(parseBoardContext({ ...edition, futureField: true }, edition.date)).toMatchObject(edition);
  });

  it("rejects wrong majors, filename drift, unsafe URLs and ambiguous statuses", () => {
    const errors = boardContextErrors({ ...edition, schemaVersion: "board-context/2", date: "2026-08-05", roomUrl: "javascript:alert(1)", noEditionReason: "conflict" }, "2026-08-04");
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining("board-context/1"),
      expect.stringContaining("match filename"),
      expect.stringContaining("http(s)"),
      expect.stringContaining("must not contain noEditionReason"),
    ]));
  });

  it("loads valid date files, ignores malformed input, and sorts newest first", async () => {
    const dir = await tempDir();
    await fs.writeFile(path.join(dir, "2026-08-04.json"), JSON.stringify(edition));
    await fs.writeFile(path.join(dir, "2026-08-05.json"), "not json");
    await fs.writeFile(path.join(dir, "notes.json"), JSON.stringify(edition));
    expect(await readBoardContext("../secrets", dir)).toBeNull();
    expect(await listBoardContexts(dir)).toEqual([edition]);
  });
});

describe("board changelog", () => {
  it("validates and loads bilingual entries", async () => {
    const dir = await tempDir();
    const file = path.join(dir, "changelog.json");
    const value = { schemaVersion: 1, entries: [{ date: "2026-08-04", summary: { en: "Added an honest archive row.", cs: "Přidán poctivý řádek archivu." }, meetingUrl: "https://boardless.example/meetings/one" }] };
    await fs.writeFile(file, JSON.stringify(value));
    expect(await loadBoardChangelog(file)).toEqual(value.entries);
    expect(boardChangelogErrors({ ...value, entries: [{ ...value.entries[0], meetingUrl: "javascript:bad" }] })).toContain("entries[0].meetingUrl must be http(s)");
  });
});

describe("weekend is not a missing edition", () => {
  const noEdition = (date: string) => ({
    schemaVersion: "board-context/1" as const,
    date,
    packageHash: "b".repeat(64),
    status: "no_edition" as const,
    noEditionReason: "budget_exhausted",
    roomUrl: "https://boardless.example/meetings/x",
  });
  const withEdition = (date: string) => ({ ...edition, schemaVersion: "board-context/1" as const, date, status: "edition" as const });

  it("knows the publishing days", () => {
    expect(isPublishingDay("2026-09-25")).toBe(true); // Friday
    expect(isPublishingDay("2026-09-26")).toBe(false); // Saturday
    expect(isPublishingDay("2026-09-27")).toBe(false); // Sunday
  });

  it("leads with Friday's edition on a Saturday", () => {
    expect(homeEditionState([noEdition("2026-09-26"), withEdition("2026-09-25")], "2026-09-25")).toEqual({
      anchor: "2026-09-26",
      missedDay: null,
      leadIsEarlier: true,
    });
  });

  it("leads with Friday's edition on a Sunday", () => {
    const state = homeEditionState([noEdition("2026-09-27"), noEdition("2026-09-26")], "2026-09-25");
    expect(state.missedDay).toBeNull();
    expect(state.anchor).toBe("2026-09-27");
  });

  it("reports a missed Wednesday", () => {
    expect(homeEditionState([noEdition("2026-09-23"), withEdition("2026-09-22")], "2026-09-22").missedDay).toBe("2026-09-23");
  });

  it("is plain on a normal weekday", () => {
    expect(homeEditionState([withEdition("2026-09-25")], "2026-09-25")).toEqual({
      anchor: "2026-09-25",
      missedDay: null,
      leadIsEarlier: false,
    });
  });
});
