import { resolveRepo } from "./config";

// Build-time fetcher for GitHub Actions workflow runs. The result is
// rendered on /health. If the API is unreachable or unauthenticated and
// rate-limited, the page renders an offline state — we never throw.
//
// Env vars (Vercel + local):
//   GITHUB_TOKEN          optional, fine-grained PAT or Actions GITHUB_TOKEN
//   GITHUB_REPOSITORY     owner/repo (Actions sets this automatically)
//   AIFIRST_REPO          override for non-Actions builds
//
// All fetches use force-cache + a 6h revalidation; we don't want a redeploy
// for every PR run.

export type WorkflowRun = {
  id: number;
  runNumber: number;
  status: string; // "completed" | "in_progress" | "queued"
  conclusion:
    | "success"
    | "failure"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | null;
  createdAt: string;
  updatedAt: string;
  durationMs: number;
  url: string;
  branch?: string;
};

export type WorkflowHealth = {
  file: string; // e.g. "daily.yml"
  label: string; // human label
  total: number;
  successCount: number;
  failureCount: number;
  lastSuccess: WorkflowRun | null;
  lastFailure: WorkflowRun | null;
  recent: WorkflowRun[]; // newest first, up to 12
  meanDurationMs: number | null;
};

export type HealthReport = {
  status: "ok" | "offline" | "no-repo";
  repo: string | null;
  generatedAt: string;
  workflows: WorkflowHealth[];
};

const WORKFLOWS: Array<{ file: string; label: string }> = [
  { file: "daily.yml", label: "daily" },
  { file: "weekly.yml", label: "weekly" },
  { file: "regenerate.yml", label: "regenerate" },
];

function projectRun(raw: {
  id: number;
  run_number?: number;
  status?: string;
  conclusion?: WorkflowRun["conclusion"];
  created_at: string;
  updated_at: string;
  html_url: string;
  head_branch?: string;
}): WorkflowRun {
  const created = new Date(raw.created_at).getTime();
  const updated = new Date(raw.updated_at).getTime();
  return {
    id: raw.id,
    runNumber: raw.run_number ?? 0,
    status: raw.status ?? "unknown",
    conclusion: raw.conclusion ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    durationMs: Math.max(0, updated - created),
    url: raw.html_url,
    branch: raw.head_branch,
  };
}

export function summariseRuns(
  file: string,
  label: string,
  runs: WorkflowRun[],
): WorkflowHealth {
  const sorted = [...runs].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
  const successes = sorted.filter((r) => r.conclusion === "success");
  const failures = sorted.filter(
    (r) => r.conclusion === "failure" || r.conclusion === "timed_out",
  );
  const completedDurations = sorted
    .filter((r) => r.status === "completed" && r.durationMs > 0)
    .map((r) => r.durationMs);
  const meanDurationMs =
    completedDurations.length > 0
      ? Math.round(
          completedDurations.reduce((a, b) => a + b, 0) /
            completedDurations.length,
        )
      : null;

  return {
    file,
    label,
    total: sorted.length,
    successCount: successes.length,
    failureCount: failures.length,
    lastSuccess: successes[0] ?? null,
    lastFailure: failures[0] ?? null,
    recent: sorted.slice(0, 12),
    meanDurationMs,
  };
}

async function fetchWorkflowRuns(
  repo: string,
  file: string,
): Promise<WorkflowRun[]> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "aifirst-health",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${repo}/actions/workflows/${file}/runs?per_page=30`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 6 * 60 * 60 },
  });
  if (!res.ok) {
    throw new Error(`github ${res.status} for ${file}`);
  }
  const data = (await res.json()) as {
    workflow_runs?: Array<Parameters<typeof projectRun>[0]>;
  };
  return (data.workflow_runs ?? []).map(projectRun);
}

export async function getHealthReport(): Promise<HealthReport> {
  const repo = resolveRepo();
  const generatedAt = new Date().toISOString();
  if (!repo) {
    return {
      status: "no-repo",
      repo: null,
      generatedAt,
      workflows: WORKFLOWS.map((w) => ({
        file: w.file,
        label: w.label,
        total: 0,
        successCount: 0,
        failureCount: 0,
        lastSuccess: null,
        lastFailure: null,
        recent: [],
        meanDurationMs: null,
      })),
    };
  }

  const results: WorkflowHealth[] = [];
  let anyOk = false;
  for (const w of WORKFLOWS) {
    try {
      const runs = await fetchWorkflowRuns(repo, w.file);
      results.push(summariseRuns(w.file, w.label, runs));
      anyOk = true;
    } catch (err) {
      console.warn(`[health] ${w.file}: ${(err as Error).message}`);
      results.push(summariseRuns(w.file, w.label, []));
    }
  }

  return {
    status: anyOk ? "ok" : "offline",
    repo,
    generatedAt,
    workflows: results,
  };
}

export function fmtDuration(ms: number | null): string {
  if (ms === null || ms === 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m ${r}s`;
}
