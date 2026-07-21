import type { EditorialConfig } from "./config";

export type QualityMetrics = {
  successfulSources?: number;
  candidateItems?: number;
  citedSources?: number;
  signalStrength?: number;
  maximumSingleSourceShare?: number;
  sourceDiversity?: number;
  duplicateStorySimilarity?: number;
  repeatedTopicFrequency?: number;
  primarySourceRelevant?: boolean;
  primarySourcePresent?: boolean;
  unsupportedWatchlistItems?: number;
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
  if (metrics.sourceDiversity !== undefined && metrics.sourceDiversity < config.quality.minimumSourceDiversity) violations.push("minimum_source_diversity");
  if (metrics.duplicateStorySimilarity !== undefined && metrics.duplicateStorySimilarity > config.quality.maximumDuplicateStorySimilarity) violations.push("maximum_duplicate_story_similarity");
  if (metrics.repeatedTopicFrequency !== undefined && metrics.repeatedTopicFrequency > config.quality.maximumRepeatedTopicFrequency) violations.push("maximum_repeated_topic_frequency");
  if (config.quality.requirePrimarySourceWhenRelevant && metrics.primarySourceRelevant && !metrics.primarySourcePresent) violations.push("primary_source_required");
  if (metrics.unsupportedWatchlistItems !== undefined && metrics.unsupportedWatchlistItems > config.quality.maximumUnsupportedWatchlistItems) violations.push("maximum_unsupported_watchlist_items");
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
    recommendedPublishMode: violations.length === 0 ? "auto" : hardCostBlocked ? "skip" : config.quality.failureAction,
  };
}

function words(value: string): Set<string> {
  return new Set(value.toLocaleLowerCase("en").normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/).filter((token) => token.length > 2));
}

export function titleSimilarity(left: string, right: string): number {
  const a = words(left);
  const b = words(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / new Set([...a, ...b]).size;
}

export function maximumTitleSimilarity(titles: readonly string[]): number {
  let maximum = 0;
  for (let i = 0; i < titles.length; i++) {
    for (let j = i + 1; j < titles.length; j++) maximum = Math.max(maximum, titleSimilarity(titles[i]!, titles[j]!));
  }
  return maximum;
}

export function sourceDiversity(sourceIds: readonly string[]): number {
  if (sourceIds.length < 2) return sourceIds.length;
  const counts = new Map<string, number>();
  for (const id of sourceIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const concentration = [...counts.values()].reduce((sum, count) => sum + (count / sourceIds.length) ** 2, 0);
  return 1 - concentration;
}
