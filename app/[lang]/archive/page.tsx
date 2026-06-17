import { IssueRow } from "@/components/IssueRow";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).archive;
  const common = dict(locale).common;
  const lp = localePrefixer(locale);

  const all = await listArticles(locale);
  const byYearMonth = groupBy(all, (a) => a.date.slice(0, 7));

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {[...byYearMonth.entries()].map(([month, issues]) => (
        <section key={month} style={{ marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 16 }}>
            {month}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {issues.map((a) => (
              <IssueRow
                key={a.slug}
                href={lp(`/articles/${a.slug}`)}
                date={a.date}
                title={a.title}
                titleSize="1.125rem"
                padding="16px 0"
                variant="meta"
                trailing={
                  a.type === "weekly" ? (
                    <span
                      className="label"
                      style={{
                        color: "var(--accent-magenta)",
                        border: "1px solid var(--hairline)",
                        padding: "2px 8px",
                      }}
                    >
                      {common.weekly}
                    </span>
                  ) : undefined
                }
              />
            ))}
          </ul>
        </section>
      ))}

      {all.length === 0 && (
        <p style={{ color: "var(--ink-muted)" }}>{t.empty}</p>
      )}
    </PageShell>
  );
}
