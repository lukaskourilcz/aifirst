import { czechDisplayDate } from "@/lib/weeks";
import { PageShell } from "@/components/PageShell";
import type { Metadata } from "next";
import { loadGlossary, slugForTerm, glossaryDefinition } from "@/lib/glossary";
import { groupBy } from "@/lib/helpers/group";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).glossary;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/glossary") };
}

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const tr = dict(locale).glossary;
  const terms = await loadGlossary();
  const sortedTerms = [...terms].sort((a, b) => a.term.localeCompare(b.term, locale));
  const grouped = groupBy(sortedTerms, (term) => term.term.trim().charAt(0).toLocaleUpperCase(locale) || "#");
  const groups = [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], locale),
  );

  return (
    <PageShell kicker={tr.kicker} title={tr.title} intro={tr.intro}>
      {groups.length ? (
        <nav className="glossary-index" aria-label={locale === "cs" ? "Abecední rejstřík" : "Alphabetical index"}>
          {groups.map(([group]) => <a key={group} href={`#letter-${encodeURIComponent(group)}`}>{group}</a>)}
        </nav>
      ) : null}
      {groups.map(([group, items]) => (
        <section key={group} id={`letter-${group}`} className="glossary-group">
          <p className="label glossary-group__letter">
            {group}
          </p>
          <dl className="glossary-list">
            {items.map((t) => (
              <div
                key={t.term}
                id={slugForTerm(t.term)}
                className="def-row glossary-entry"
              >
                <dt>
                  <p className="glossary-entry__term">
                    {t.term}
                  </p>
                  {t.aliases.length > 0 && (
                    <p className="label label--muted glossary-entry__meta">
                      {tr.aka} {t.aliases.join(" · ")}
                    </p>
                  )}
                  {t.first_seen && (
                    <p className="label label--muted glossary-entry__meta">
                      {tr.firstSeen} {czechDisplayDate(t.first_seen)}
                    </p>
                  )}
                </dt>
                <dd>
                  {glossaryDefinition(t, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {terms.length === 0 && (
        <p className="label label--muted route-empty-state">
          {tr.empty}
        </p>
      )}
    </PageShell>
  );
}
