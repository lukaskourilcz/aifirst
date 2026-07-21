export type WorkflowKind = "daily" | "weekly" | "regenerate";
export type RunStatus = "success" | "degraded" | "failed" | "skipped";
export type StageStatus = "success" | "failed" | "skipped";

export type Money = { amount: number; currency: "USD" };

export type UsageLine = {
  provider: "anthropic" | string;
  model: string;
  stage: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  cost?: Money;
};

export type GenerationRunReport = {
  schemaVersion: 1;
  runId: string;
  workflow: WorkflowKind;
  issueKind: "daily" | "weekly";
  issueDate: string;
  language: string;
  publishMode: "auto" | "pull_request" | "dry_run";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  status: RunStatus;
  repository: { commitSha?: string; branch?: string; articleSlug?: string };
  stages: Array<{
    name: string;
    status: StageStatus;
    startedAt: string;
    completedAt: string;
    durationMs: number;
    errorCode?: string;
    errorMessage?: string;
  }>;
  scraping: {
    configuredSources: number;
    attemptedSources: number;
    successfulSources: number;
    failedSources: number;
    candidateItems: number;
  };
  editorial: {
    selectedItems: number;
    citedSources: number;
    signalStrength?: number;
    outputWords?: number;
  };
  usage: UsageLine[];
  image?: { provider: string; generated: boolean; cost?: Money };
  totalCost?: Money;
  warnings: string[];
};

export function validateRunReport(report: GenerationRunReport): string[] {
  const errors: string[] = [];
  if (report.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!report.runId) errors.push("runId is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(report.issueDate)) errors.push("issueDate must be YYYY-MM-DD");
  if (new Date(report.completedAt).getTime() < new Date(report.startedAt).getTime()) errors.push("completedAt precedes startedAt");
  if (report.durationMs < 0) errors.push("durationMs must be non-negative");
  for (const [index, line] of report.usage.entries()) {
    for (const key of ["inputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"] as const) {
      const value = line[key];
      if (value !== undefined && (!Number.isInteger(value) || value < 0)) errors.push(`usage[${index}].${key} must be a non-negative integer`);
    }
    if (line.cost && (line.cost.amount < 0 || line.cost.currency !== "USD")) errors.push(`usage[${index}].cost is invalid`);
  }
  return errors;
}
