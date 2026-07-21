import { describe, expect, it } from "vitest";
import { loadEditorialConfig } from "../config";
import { evaluateGuardrails } from "../guardrails";

describe("quality and cost guardrails", () => {
  it("passes a healthy run", async () => {
    const config = await loadEditorialConfig();
    const result = evaluateGuardrails({ successfulSources: 20, candidateItems: 50, citedSources: 5, signalStrength: 80, maximumSingleSourceShare: 0.3 }, config);
    expect(result.passed).toBe(true);
  });

  it("reports failures without blocking in initial report-only mode", async () => {
    const config = await loadEditorialConfig();
    const result = evaluateGuardrails({ successfulSources: 1, candidateItems: 2, citedSources: 1 }, config);
    expect(result.passed).toBe(false);
    expect(result.enforced).toBe(false);
    expect(result.recommendedPublishMode).toBe("pull_request");
  });

  it("recommends skipping when an enforced hard cost limit is exceeded", async () => {
    const config = await loadEditorialConfig();
    const enforced = { ...config, quality: { ...config.quality, enforcement: "enforce" as const }, budgets: { ...config.budgets, hardCostPerRun: 1 } };
    const result = evaluateGuardrails({ successfulSources: 20, candidateItems: 30, citedSources: 4, costPerRun: 1.01 }, enforced);
    expect(result.recommendedPublishMode).toBe("skip");
  });

  it("always enforces a configured hard cost limit", async () => {
    const config = await loadEditorialConfig();
    const limited = { ...config, budgets: { ...config.budgets, hardCostPerRun: 0.5 } };
    const result = evaluateGuardrails({ costPerRun: 0.51 }, limited);
    expect(result.enforced).toBe(true);
    expect(result.recommendedPublishMode).toBe("skip");
  });

  it("fails closed when a hard limit is configured but cost is unavailable", async () => {
    const config = await loadEditorialConfig();
    const limited = { ...config, budgets: { ...config.budgets, hardCostPerRun: 0.5 } };
    const result = evaluateGuardrails({}, limited);
    expect(result.violations).toContain("hard_cost_unavailable");
    expect(result.enforced).toBe(true);
    expect(result.recommendedPublishMode).toBe("skip");
  });
});
