import Link from "next/link";
import { CopyCommand } from "@/components/CopyCommand";
import { IssueRow } from "@/components/IssueRow";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { githubRepo } from "@/lib/config";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";
export const metadata = { robots: { index: false } };

export default async function AdminPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).admin;
  const lp = localePrefixer(locale);
  const all = await listArticles(locale);
  const repo = githubRepo();

  return (
    <PageShell kicker={t.kicker} title={t.title} kickerTone="magenta">
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "2em",
        }}
      >
        This page is informational — it does not call any APIs from the
        browser. To regenerate an issue, run the gh CLI snippet for that
        date, or trigger the workflow_dispatch from the GitHub Actions
        page. Both routes use the same{" "}
        <Link href={`https://github.com/${repo}/actions/workflows/regenerate.yml`}>
          regenerate workflow
        </Link>
        , which calls the Anthropic API on the server and commits the new
        MDX back to the branch.
      </p>

      <section style={{ marginTop: 32 }}>
        <p className="label" style={{ marginBottom: 12 }}>
          regenerate a new date (daily)
        </p>
        <CopyCommand command={`gh workflow run regenerate.yml -R ${repo} -f date=$(date -u +%F) -f kind=daily`} />
      </section>

      <section style={{ marginTop: 32 }}>
        <p className="label" style={{ marginBottom: 12 }}>
          regenerate Sunday digest
        </p>
        <CopyCommand command={`gh workflow run regenerate.yml -R ${repo} -f date=$(date -u +%F) -f kind=weekly`} />
      </section>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          per-issue regenerate commands
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {all.map((a) => {
            const kind = a.type === "weekly" ? "weekly" : "daily";
            return (
              <IssueRow
                key={a.slug}
                href={lp(`/articles/${a.slug}`)}
                date={a.date}
                title={a.title}
                titleSize="0.95rem"
                titleColor="var(--ink-primary)"
                variant="cmd"
                dateSuffix={
                  a.type === "weekly" ? (
                    <span style={{ color: "var(--accent-magenta)" }}> ·w</span>
                  ) : undefined
                }
                trailing={
                  <CopyCommand
                    command={`gh workflow run regenerate.yml -R ${repo} -f date=${a.date} -f kind=${kind}`}
                  />
                }
              />
            );
          })}
        </ul>
      </section>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 12 }}>
          notes
        </p>
        <ul
          style={{
            paddingLeft: "1.2em",
            color: "var(--ink-muted)",
            lineHeight: 1.6,
          }}
        >
          <li>
            Regeneration overwrites the existing MDX and illustration for
            that date.
          </li>
          <li>
            Anthropic and image-provider credentials live in GitHub
            Actions secrets — not in the browser.
          </li>
          <li>
            The regenerate workflow validates the date format before
            spending API tokens.
          </li>
        </ul>
      </section>
    </PageShell>
  );
}
