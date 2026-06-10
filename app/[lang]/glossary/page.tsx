import { loadGlossary, slugForTerm, glossaryDefinition } from "@/lib/glossary";
import { groupBy } from "@/lib/helpers/group";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const tr = dict(locale).glossary;
  const terms = await loadGlossary();
  const grouped = groupBy(terms, (t) => (t.tags ?? [])[0] ?? "other");
  const groups = [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">{tr.kicker}</p>
      <h1>{tr.title}</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "3em",
        }}
      >
        {tr.intro}
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
                className="def-row"
                style={{
                  scrollMarginTop: 80,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--hairline)",
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
                      {tr.aka} {t.aliases.join(" · ")}
                    </p>
                  )}
                  {t.first_seen && (
                    <p
                      className="label"
                      style={{ margin: "4px 0 0", color: "var(--ink-dim)" }}
                    >
                      {tr.firstSeen} {t.first_seen}
                    </p>
                  )}
                </dt>
                <dd style={{ margin: 0, color: "var(--ink-muted)" }}>
                  {glossaryDefinition(t, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {terms.length === 0 && (
        <p className="label" style={{ color: "var(--ink-dim)" }}>
          {tr.empty}
        </p>
      )}
    </section>
  );
}
