import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";
import { slugForTerm } from "@/lib/glossary";

export function GlossaryBlock({
  terms,
}: {
  terms: GlossaryTerm[];
}) {
  if (!terms.length) return null;
  return (
    <section
      aria-label="Glossary for this issue"
      style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <p className="label" style={{ marginBottom: 16 }}>
        glossary for this issue
      </p>
      <dl style={{ margin: 0 }}>
        {terms.map((t) => (
          <div
            key={t.term}
            className="def-row def-row--tight"
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <dt
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--accent-cyan)",
                letterSpacing: "0.04em",
              }}
            >
              <Link
                href={`/glossary#${slugForTerm(t.term)}`}
                style={{ borderBottom: "none" }}
              >
                {t.term}
              </Link>
            </dt>
            <dd style={{ margin: 0, color: "var(--ink-muted)" }}>
              {t.definition}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
