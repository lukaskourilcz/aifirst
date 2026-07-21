import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { GenerationRunReport, RunStatus, StageStatus, UsageLine, WorkflowKind } from "./types";
import { totalUsageCost } from "./pricing";

export class RunReporter {
  private readonly startedAt = new Date();
  private readonly stages: GenerationRunReport["stages"] = [];
  readonly usage: UsageLine[] = [];
  readonly warnings: string[] = [];

  constructor(
    readonly workflow: WorkflowKind,
    readonly issueKind: "daily" | "weekly",
    readonly issueDate: string,
    readonly publishMode: GenerationRunReport["publishMode"],
  ) {}

  async stage<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const started = new Date();
    try {
      const value = await operation();
      this.addStage(name, "success", started);
      return value;
    } catch (error) {
      this.addStage(name, "failed", started, error);
      throw error;
    }
  }

  skip(name: string) { this.addStage(name, "skipped", new Date()); }
  addUsage(line: UsageLine | undefined) { if (line) this.usage.push(line); }
  warn(message: string) {
    if (!this.warnings.includes(message)) this.warnings.push(message);
  }

  private addStage(name: string, status: StageStatus, started: Date, error?: unknown) {
    const completed = new Date();
    this.stages.push({
      name,
      status,
      startedAt: started.toISOString(),
      completedAt: completed.toISOString(),
      durationMs: Math.max(0, completed.getTime() - started.getTime()),
      ...(error ? { errorCode: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message.slice(0, 500) : "unknown error" } : {}),
    });
  }

  build(input: {
    status: RunStatus;
    language?: string;
    articleSlug?: string;
    configuredSources?: number;
    attemptedSources?: number;
    successfulSources?: number;
    candidateItems?: number;
    selectedItems?: number;
    citedSources?: number;
    signalStrength?: number;
    outputWords?: number;
    image?: GenerationRunReport["image"];
  }): GenerationRunReport {
    const completed = new Date();
    const usageCost = totalUsageCost(this.usage);
    const paidImageCostMissing = input.image?.generated === true && input.image.provider === "fal" && !input.image.cost;
    if (!usageCost && this.usage.length > 0) this.warn("Cost unavailable for one or more usage lines");
    if (paidImageCostMissing) this.warn("Image cost unavailable");
    const totalCost = usageCost && !paidImageCostMissing
      ? {
          amount: Number((usageCost.amount + (input.image?.cost?.amount ?? 0)).toFixed(8)),
          currency: "USD" as const,
        }
      : null;
    return {
      schemaVersion: 1,
      runId: process.env.GITHUB_RUN_ID ?? randomUUID(),
      workflow: this.workflow,
      issueKind: this.issueKind,
      issueDate: this.issueDate,
      language: input.language ?? "multilingual",
      publishMode: this.publishMode,
      startedAt: this.startedAt.toISOString(),
      completedAt: completed.toISOString(),
      durationMs: Math.max(0, completed.getTime() - this.startedAt.getTime()),
      status: input.status,
      repository: {
        commitSha: process.env.GITHUB_SHA,
        branch: process.env.GITHUB_REF_NAME,
        articleSlug: input.articleSlug,
      },
      stages: this.stages,
      scraping: {
        configuredSources: input.configuredSources ?? 0,
        attemptedSources: input.attemptedSources ?? 0,
        successfulSources: input.successfulSources ?? 0,
        failedSources: Math.max(0, (input.attemptedSources ?? 0) - (input.successfulSources ?? 0)),
        candidateItems: input.candidateItems ?? 0,
      },
      editorial: {
        selectedItems: input.selectedItems ?? 0,
        citedSources: input.citedSources ?? 0,
        signalStrength: input.signalStrength,
        outputWords: input.outputWords,
      },
      usage: this.usage,
      image: input.image,
      ...(totalCost ? { totalCost } : {}),
      warnings: [...this.warnings],
    };
  }
}

export async function writeRunReport(report: GenerationRunReport): Promise<string> {
  const dir = path.join(process.cwd(), "generated", "run-reports");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${report.issueDate}-${report.workflow}-${report.runId}.json`);
  await fs.writeFile(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

export async function sendRunReport(report: GenerationRunReport): Promise<"sent" | "skipped" | "failed"> {
  const url = process.env.OWNDASHBOARD_RUN_REPORT_URL?.trim();
  const token = process.env.OWNDASHBOARD_RUN_REPORT_TOKEN?.trim();
  if (!url || !token) return "skipped";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "idempotency-key": report.runId },
        body: JSON.stringify(report),
        signal: AbortSignal.timeout(8_000),
      });
      if (response.ok) return "sent";
    } catch {
      // Bounded retry; the local artifact remains canonical for this run.
    }
  }
  return "failed";
}
