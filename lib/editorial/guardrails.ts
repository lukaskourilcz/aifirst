import type { EditorialConfig } from "./config";

export type QualityMetrics = {
  successfulSources?: number;
  candidateItems?: number;
  citedSources?: number;
  signalStrength?: number;
  maximumSingleSourceShare?: number;
  costPerRun?: number;
};

export type GuardrailResult = {
  passed: boolean;
  enforced: boolean;
  violations: string[];
  recommendedPublishMode: "auto" | "pull_request" | "skip";
};

export function evaluateGuardrails(metrics: QualityMetrics, config: EditorialConfig): GuardrailResult {
  const violations: string[] = [];
  if (metrics.successfulSources !== undefined && metrics.successfulSources < config.quality.minimumSuccessfulSources) violations.push("minimum_successful_sources");
  if (metrics.candidateItems !== undefined && metrics.candidateItems < config.quality.minimumCandidateItems) violations.push("minimum_candidate_items");
  if (metrics.citedSources !== undefined && metrics.citedSources < config.quality.minimumCitedSources) violations.push("minimum_cited_sources");
  if (metrics.signalStrength !== undefined && metrics.signalStrength < config.quality.minimumSignalStrength) violations.push("minimum_signal_strength");
  if (metrics.maximumSingleSourceShare !== undefined && metrics.maximumSingleSourceShare > config.quality.maximumSingleSourceShare) violations.push("maximum_single_source_share");
  const hardCost = config.budgets.hardCostPerRun;
  if (hardCost !== null && metrics.costPerRun !== undefined && metrics.costPerRun > hardCost) violations.push("hard_cost_per_run");
  if (hardCost !== null && metrics.costPerRun === undefined) violations.push("hard_cost_unavailable");
  const warningCost = config.budgets.warningCostPerRun;
  if (warningCost !== null && metrics.costPerRun !== undefined && metrics.costPerRun > warningCost) violations.push("warning_cost_per_run");
  const hardCostBlocked = violations.includes("hard_cost_per_run") || violations.includes("hard_cost_unavailable");
  const enforced = config.quality.enforcement === "enforce" || hardCostBlocked;
  return {
    passed: violations.length === 0,
    enforced,
    violations,
    recommendedPublishMode: violations.length === 0 ? "auto" : hardCostBlocked ? "skip" : "pull_request",
  };
}
