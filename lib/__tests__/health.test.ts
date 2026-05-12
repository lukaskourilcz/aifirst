import { describe, it, expect } from "vitest";
import { summariseRuns, fmtDuration, type WorkflowRun } from "../health.js";

function run(
  partial: Partial<WorkflowRun> & {
    conclusion: WorkflowRun["conclusion"];
    createdAt: string;
    updatedAt: string;
  },
): WorkflowRun {
  return {
    id: Math.floor(Math.random() * 1e9),
    runNumber: partial.runNumber ?? 0,
    status: partial.status ?? "completed",
    conclusion: partial.conclusion,
    createdAt: partial.createdAt,
    updatedAt: partial.updatedAt,
    durationMs:
      partial.durationMs ??
      new Date(partial.updatedAt).getTime() -
        new Date(partial.createdAt).getTime(),
    url: partial.url ?? "https://example.com",
    branch: partial.branch,
  };
}

describe("summariseRuns", () => {
  const runs: WorkflowRun[] = [
    run({
      conclusion: "success",
      createdAt: "2026-05-12T06:00:00Z",
      updatedAt: "2026-05-12T06:01:00Z",
      runNumber: 5,
    }),
    run({
      conclusion: "failure",
      createdAt: "2026-05-11T06:00:00Z",
      updatedAt: "2026-05-11T06:00:45Z",
      runNumber: 4,
    }),
    run({
      conclusion: "success",
      createdAt: "2026-05-10T06:00:00Z",
      updatedAt: "2026-05-10T06:01:30Z",
      runNumber: 3,
    }),
  ];

  it("counts success and failure separately", () => {
    const h = summariseRuns("daily.yml", "daily", runs);
    expect(h.total).toBe(3);
    expect(h.successCount).toBe(2);
    expect(h.failureCount).toBe(1);
  });

  it("picks the most recent success and failure", () => {
    const h = summariseRuns("daily.yml", "daily", runs);
    expect(h.lastSuccess?.runNumber).toBe(5);
    expect(h.lastFailure?.runNumber).toBe(4);
  });

  it("returns null lastFailure when there are no failures", () => {
    const okOnly = runs.filter((r) => r.conclusion === "success");
    const h = summariseRuns("x.yml", "x", okOnly);
    expect(h.lastFailure).toBeNull();
  });

  it("orders recent newest-first", () => {
    const h = summariseRuns("daily.yml", "daily", runs);
    expect(h.recent.map((r) => r.runNumber)).toEqual([5, 4, 3]);
  });

  it("computes mean duration only across completed runs", () => {
    const h = summariseRuns("daily.yml", "daily", runs);
    // 60s + 45s + 90s = 195s mean = 65s = 65000ms
    expect(h.meanDurationMs).toBe(65000);
  });

  it("handles empty input", () => {
    const h = summariseRuns("x.yml", "x", []);
    expect(h.total).toBe(0);
    expect(h.lastSuccess).toBeNull();
    expect(h.lastFailure).toBeNull();
    expect(h.meanDurationMs).toBeNull();
  });
});

describe("fmtDuration", () => {
  it("renders seconds under a minute", () => {
    expect(fmtDuration(45_000)).toBe("45s");
  });
  it("renders whole minutes", () => {
    expect(fmtDuration(120_000)).toBe("2m");
  });
  it("renders minutes and seconds", () => {
    expect(fmtDuration(95_000)).toBe("1m 35s");
  });
  it("returns em-dash for null or zero", () => {
    expect(fmtDuration(null)).toBe("—");
    expect(fmtDuration(0)).toBe("—");
  });
});
