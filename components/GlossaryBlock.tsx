import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";
import { slugForTerm, glossaryDefinition } from "@/lib/glossary";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function GlossaryBlock({
  terms,
  locale,
}: {
  terms: GlossaryTerm[];
  locale: Locale;
}) {
  if (!terms.length) return null;
  return (
    <section
      aria-label="Glossary for this issue"
      style={{
        marginTop: "var(--gutter-gap)",
        paddingTop: 32,
        borderTop: "1px solid var(--color-fog)",
      }}
    >
      <p className="label" style={{ marginBottom: 16 }}>
        {dict(locale).article.glossaryForIssue}
      </p>
      <div style={{ margin: 0 }}>
        {terms.map((t) => (
          <details
            key={t.term}
            className="def-row def-row--tight"
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--color-fog)",
            }}
          >
            <summary
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-blueprint-blue)",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              <dfn style={{ fontStyle: "normal" }}>{t.term}</dfn>
            </summary>
            <p style={{ margin: "10px 0 0", color: "var(--ink-muted)" }}>
              {glossaryDefinition(t, locale)}{" "}
              <Link href={localePath(locale, `/glossary#${slugForTerm(t.term)}`)}>
                {dict(locale).article.fullGlossaryEntry} →
              </Link>
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
