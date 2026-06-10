import Link from "next/link";
import { listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";
import { type Locale, localePath } from "@/lib/i18n/config";
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
  const lp = (p: string) => localePath(locale, p);

  const all = await listArticles(locale);
  const byYearMonth = groupBy(all, (a) => a.date.slice(0, 7));

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">{t.kicker}</p>
      <h1>{t.title}</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "60ch",
          marginBottom: "3em",
        }}
      >
        {t.intro}
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
                className="entry-row entry-row--meta"
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <Link href={lp(`/articles/${a.slug}`)} className="label">
                  {a.date}
                </Link>
                <Link href={lp(`/articles/${a.slug}`)} style={{ fontSize: "1.125rem" }}>
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
                    {common.weekly}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {all.length === 0 && (
        <p style={{ color: "var(--ink-muted)" }}>{t.empty}</p>
      )}
    </section>
  );
}
