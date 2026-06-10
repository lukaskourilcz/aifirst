import { loadGlossary, slugForTerm } from "@/lib/glossary";
import { groupBy } from "@/lib/helpers/group";

export const dynamic = "force-static";
export const metadata = { title: "Glossary" };

export default async function GlossaryPage() {
  const terms = await loadGlossary();
  const grouped = groupBy(terms, (t) => (t.tags ?? [])[0] ?? "other");
  const groups = [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">glossary</p>
      <h1>Recurring terms in the magazine.</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "3em",
        }}
      >
        Terms that surface across multiple issues. Edited by hand. Each
        issue can attach a per-issue glossary block via its{" "}
        <code>glossary_terms</code> frontmatter field.
      </p>

      {groups.map(([group, items]) => (
        <section key={group} style={{ marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 16 }}>
            {group}
          </p>
          <dl style={{ margin: 0 }}>
            {items.map((t) => (
              <div
                key={t.term}
                id={slugForTerm(t.term)}
                style={{
                  scrollMarginTop: 80,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--hairline)",
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 24,
                  alignItems: "baseline",
                }}
              >
                <dt>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--accent-cyan)",
                      fontSize: "1.05rem",
                      margin: "0 0 4px",
                    }}
                  >
                    {t.term}
                  </p>
                  {t.aliases.length > 0 && (
                    <p
                      className="label"
                      style={{
                        margin: 0,
                        color: "var(--ink-dim)",
                      }}
                    >
                      aka {t.aliases.join(" · ")}
                    </p>
                  )}
                  {t.first_seen && (
                    <p
                      className="label"
                      style={{ margin: "4px 0 0", color: "var(--ink-dim)" }}
                    >
                      first seen {t.first_seen}
                    </p>
                  )}
                </dt>
                <dd style={{ margin: 0, color: "var(--ink-muted)" }}>
                  {t.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {terms.length === 0 && (
        <p className="label" style={{ color: "var(--ink-dim)" }}>
          glossary is empty.
        </p>
      )}
    </section>
  );
}
