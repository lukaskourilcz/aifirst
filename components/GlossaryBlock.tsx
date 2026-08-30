import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";
import { slugForTerm, glossaryDefinition } from "@/lib/glossary";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { SectionMasthead } from "./editorial/SectionMasthead";

export function GlossaryBlock({
  terms,
  locale,
}: {
  terms: GlossaryTerm[];
  locale: Locale;
}) {
  if (!terms.length) return null;
  return (
    <section className="issue-glossary" aria-labelledby="issue-glossary-heading">
      <SectionMasthead id="issue-glossary-heading" kicker={dict(locale).article.glossaryForIssue} />
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
