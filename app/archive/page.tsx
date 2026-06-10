import Link from "next/link";
import { listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";

export const dynamic = "force-static";

export const metadata = {
  title: "Archive",
};

export default async function ArchivePage() {
  const all = await listArticles();
  const byYearMonth = groupBy(all, (a) => a.date.slice(0, 7));

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">archive</p>
      <h1>Every issue.</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "60ch",
          marginBottom: "3em",
        }}
      >
        Each issue is a single feature written from the day&rsquo;s most
        interesting tech and AI items.
      </p>

      {[...byYearMonth.entries()].map(([month, issues]) => (
        <section key={month} style={{ marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 16 }}>
            {month}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {issues.map((a) => (
              <li
                key={a.slug}
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid var(--hairline)",
                  display: "grid",
                  gridTemplateColumns: "140px 1fr auto",
                  gap: 16,
                  alignItems: "baseline",
                }}
              >
                <Link href={`/articles/${a.slug}`} className="label">
                  {a.date}
                </Link>
                <Link href={`/articles/${a.slug}`} style={{ fontSize: "1.125rem" }}>
                  {a.title}
                </Link>
                {a.type === "weekly" && (
                  <span
                    className="label"
                    style={{
                      color: "var(--accent-magenta)",
                      border: "1px solid var(--hairline)",
                      padding: "2px 8px",
                    }}
                  >
                    weekly
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {all.length === 0 && (
        <p style={{ color: "var(--ink-muted)" }}>No issues yet.</p>
      )}
    </section>
  );
}
