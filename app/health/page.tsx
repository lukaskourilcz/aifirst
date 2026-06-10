import { HealthRow } from "@/components/HealthRow";
import { getHealthReport } from "@/lib/health";

export const dynamic = "force-static";
export const revalidate = 21600;
export const metadata = { title: "Health", robots: { index: false } };

export default async function HealthPage() {
  const report = await getHealthReport();
  const generated = new Date(report.generatedAt);

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p
        className="label"
        style={{ color: "var(--accent-cyan)" }}
      >
        health · pipeline status
      </p>
      <h1>Is the magazine alive?</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "2.5em",
        }}
      >
        Live(ish) view of the GitHub Actions runs that produce daily and
        weekly issues. Data is pulled from the GitHub REST API at build
        time and cached for six hours. The success-rate number is over all
        runs returned by the API (up to the most recent 30 per workflow).
      </p>

      {report.status === "no-repo" && (
        <aside
          style={{
            padding: 16,
            border: "1px solid var(--hairline)",
            borderLeft: "2px solid var(--accent-amber)",
            background: "rgba(255,181,71,0.05)",
            marginBottom: 24,
            color: "var(--ink-primary)",
          }}
        >
          <p
            className="label"
            style={{ color: "var(--accent-amber)", marginBottom: 8 }}
          >
            no repo configured
          </p>
          <p style={{ margin: 0, color: "var(--ink-muted)" }}>
            Set <code>AIFIRST_REPO</code> (or rely on the{" "}
            <code>GITHUB_REPOSITORY</code> env var set by Actions) so this
            page knows which repo to query.
          </p>
        </aside>
      )}

      {report.status === "offline" && (
        <aside
          style={{
            padding: 16,
            border: "1px solid var(--hairline)",
            borderLeft: "2px solid var(--accent-magenta)",
            background: "rgba(255,79,216,0.05)",
            marginBottom: 24,
            color: "var(--ink-primary)",
          }}
        >
          <p
            className="label"
            style={{ color: "var(--accent-magenta)", marginBottom: 8 }}
          >
            offline
          </p>
          <p style={{ margin: 0, color: "var(--ink-muted)" }}>
            Couldn&rsquo;t reach the GitHub Actions API at build time.
            Either the build environment has no outbound network access,
            the rate limit was hit, or <code>GITHUB_TOKEN</code> is
            missing.
          </p>
        </aside>
      )}

      <section>
        {report.workflows.map((w) => (
          <HealthRow key={w.file} health={w} />
        ))}
      </section>

      <footer
        className="label"
        style={{
          marginTop: 32,
          color: "var(--ink-dim)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 24px",
        }}
      >
        <span>
          {report.repo ? `repo · ${report.repo}` : "repo · unset"}
        </span>
        <span>generated · {generated.toISOString()}</span>
        <span>cache · 6h</span>
      </footer>
    </section>
  );
}
