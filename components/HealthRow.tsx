import type { WorkflowHealth, WorkflowRun } from "@/lib/health";
import { fmtDuration } from "@/lib/health";

function colorFor(run: WorkflowRun): string {
  if (run.status !== "completed") return "var(--accent-amber)";
  if (run.conclusion === "success") return "var(--accent-cyan)";
  if (run.conclusion === "failure" || run.conclusion === "timed_out")
    return "var(--accent-magenta)";
  return "var(--ink-dim)";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function HealthRow({ health }: { health: WorkflowHealth }) {
  const successRate =
    health.total > 0
      ? Math.round((health.successCount / health.total) * 100)
      : null;

  return (
    <article
      style={{
        padding: 20,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
        marginBottom: 16,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <p
            className="label"
            style={{ color: "var(--accent-cyan)", marginBottom: 4 }}
          >
            workflow
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              margin: 0,
              color: "var(--ink-primary)",
            }}
          >
            {health.label}
          </h3>
          <p
            className="label"
            style={{ margin: "4px 0 0", color: "var(--ink-dim)" }}
          >
            {health.file}
          </p>
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            color:
              successRate === null
                ? "var(--ink-dim)"
                : successRate >= 90
                ? "var(--accent-cyan)"
                : successRate >= 50
                ? "var(--accent-amber)"
                : "var(--accent-magenta)",
          }}
        >
          {successRate === null ? "—" : `${successRate}%`}
        </div>
      </header>

      {health.recent.length === 0 ? (
        <p
          className="label"
          style={{ color: "var(--ink-dim)", margin: 0 }}
        >
          no run data
        </p>
      ) : (
        <>
          <div
            aria-label={`last ${health.recent.length} runs, newest right`}
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              justifyContent: "flex-end",
              gap: 4,
              marginBottom: 12,
            }}
          >
            {health.recent.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`run #${r.runNumber} ${r.conclusion ?? r.status}`}
                title={`#${r.runNumber} · ${r.conclusion ?? r.status} · ${fmtDuration(r.durationMs)}`}
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 24,
                  background: colorFor(r),
                  borderBottom: "none",
                  boxShadow:
                    r.conclusion === "success"
                      ? "0 0 6px rgba(92, 240, 255, 0.55)"
                      : "none",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              fontSize: "0.85rem",
              color: "var(--ink-muted)",
            }}
          >
            <div>
              <p
                className="label"
                style={{ marginBottom: 4 }}
              >
                last success
              </p>
              {health.lastSuccess ? (
                <a
                  href={health.lastSuccess.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    color: "var(--ink-primary)",
                    borderBottom: "1px dashed var(--hairline)",
                  }}
                >
                  #{health.lastSuccess.runNumber} ·{" "}
                  {relativeTime(health.lastSuccess.createdAt)}
                </a>
              ) : (
                <span style={{ color: "var(--ink-dim)" }}>—</span>
              )}
            </div>
            <div>
              <p
                className="label"
                style={{ marginBottom: 4 }}
              >
                last failure
              </p>
              {health.lastFailure ? (
                <a
                  href={health.lastFailure.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    color: "var(--accent-magenta)",
                    borderBottom: "1px dashed var(--hairline)",
                  }}
                >
                  #{health.lastFailure.runNumber} ·{" "}
                  {relativeTime(health.lastFailure.createdAt)}
                </a>
              ) : (
                <span style={{ color: "var(--ink-dim)" }}>none</span>
              )}
            </div>
            <div>
              <p
                className="label"
                style={{ marginBottom: 4 }}
              >
                mean duration
              </p>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink-primary)",
                }}
              >
                {fmtDuration(health.meanDurationMs)}
              </span>
            </div>
            <div>
              <p
                className="label"
                style={{ marginBottom: 4 }}
              >
                total runs
              </p>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink-primary)",
                }}
              >
                {String(health.total).padStart(2, "0")}
              </span>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
