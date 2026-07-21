import { describe, expect, it } from "vitest";
import { calculateUsageCost, totalUsageCost } from "../pricing";
import { validateRunReport, type GenerationRunReport } from "../types";
import { RunReporter } from "../report";

describe("generation pricing", () => {
  it("calculates input, output and cache token cost", () => {
    const cost = calculateUsageCost({ provider: "anthropic", model: "claude-sonnet-4-6", stage: "curate", inputTokens: 1_000_000, outputTokens: 1_000_000, cacheWriteTokens: 1_000_000, cacheReadTokens: 1_000_000 });
    expect(cost?.amount).toBe(22.05);
  });

  it("returns unavailable for unknown pricing or missing usage", () => {
    expect(calculateUsageCost({ provider: "anthropic", model: "future", stage: "write" })).toBeNull();
  });

  it("does not report a partial total as actual cost", () => {
    expect(totalUsageCost([{ provider: "anthropic", model: "future", stage: "write" }])).toBeNull();
  });

  it("validates run-report token counts", () => {
    const report = {
      schemaVersion: 1, runId: "run", workflow: "daily", issueKind: "daily", issueDate: "2026-07-21", language: "en", publishMode: "dry_run",
      startedAt: "2026-07-21T00:00:00Z", completedAt: "2026-07-21T00:00:01Z", durationMs: 1000, status: "success", repository: {}, stages: [],
      scraping: { configuredSources: 1, attemptedSources: 1, successfulSources: 1, failedSources: 0, candidateItems: 1 }, editorial: { selectedItems: 1, citedSources: 1 },
      usage: [{ provider: "anthropic", model: "x", stage: "write", inputTokens: -1 }], warnings: [],
    } as GenerationRunReport;
    expect(validateRunReport(report)).toContain("usage[0].inputTokens must be a non-negative integer");
  });

  it("does not claim a complete total when paid image cost is missing", () => {
    const reporter = new RunReporter("daily", "daily", "2026-07-21", "dry_run");
    reporter.addUsage({ provider: "anthropic", model: "claude-sonnet-4-6", stage: "write", inputTokens: 1_000, outputTokens: 1_000, cost: { amount: 0.018, currency: "USD" } });
    const report = reporter.build({ status: "success", image: { provider: "fal", generated: true } });
    expect(report.totalCost).toBeUndefined();
    expect(report.warnings).toContain("Image cost unavailable");
  });

  it("records structured warning events and per-source results", () => {
    const reporter = new RunReporter("daily", "daily", "2026-07-21", "auto");
    reporter.setPublishMode("pull_request");
    reporter.setSourceResults([{ sourceId: "example", status: "failed", candidateItems: 0, durationMs: 12, errorCode: "TimeoutError" }]);
    reporter.warn("source_failed:example");
    const report = reporter.build({ status: "degraded", attemptedSources: 1, successfulSources: 0 });
    expect(report.publishMode).toBe("pull_request");
    expect(report.scraping.sourceResults?.[0]?.sourceId).toBe("example");
    expect(report.events?.[0]).toMatchObject({ level: "warning", code: "source_failed", message: "example" });
  });

  it("rejects calendar dates that merely match the date pattern", () => {
    const reporter = new RunReporter("daily", "daily", "2026-02-31", "dry_run");
    expect(validateRunReport(reporter.build({ status: "failed" }))).toContain("issueDate must be a real YYYY-MM-DD date");
  });
});
