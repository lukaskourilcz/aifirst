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
      <div>
        {terms.map((t) => (
          <details key={t.term} className="def-row def-row--tight issue-glossary__term">
            <summary>
              <dfn>{t.term}</dfn>
            </summary>
            <p>
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
