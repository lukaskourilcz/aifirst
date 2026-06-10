import { HealthRow } from "@/components/HealthRow";
import { getHealthReport } from "@/lib/health";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";
export const revalidate = 21600;
export const metadata = { robots: { index: false } };

export default async function HealthPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).health;
  const report = await getHealthReport();
  const generated = new Date(report.generatedAt);

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label" style={{ color: "var(--accent-cyan)" }}>
        {t.kicker}
      </p>
      <h1>{t.title}</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "2.5em",
        }}
      >
        {t.intro}
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
            {t.noRepoTitle}
          </p>
          <p style={{ margin: 0, color: "var(--ink-muted)" }}>{t.noRepoBody}</p>
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
            {t.offlineTitle}
          </p>
          <p style={{ margin: 0, color: "var(--ink-muted)" }}>{t.offlineBody}</p>
        </aside>
      )}

      <section>
        {report.workflows.map((w) => (
          <HealthRow key={w.file} health={w} locale={locale} />
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
          {report.repo ? `${t.repo} · ${report.repo}` : `${t.repo} · ${t.unset}`}
        </span>
        <span>{t.generated} · {generated.toISOString()}</span>
        <span>{t.cache} · 6h</span>
      </footer>
    </section>
  );
}
