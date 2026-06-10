import Link from "next/link";
import { CopyCommand } from "@/components/CopyCommand";
import { listArticles } from "@/lib/content";
import { githubRepo } from "@/lib/config";

export const dynamic = "force-static";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const all = await listArticles();
  const REPO = githubRepo();

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p
        className="label"
        style={{ color: "var(--accent-magenta)", marginBottom: 8 }}
      >
        admin · operator console
      </p>
      <h1>Re-run the pipeline.</h1>
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
        <Link href={`https://github.com/${REPO}/actions/workflows/regenerate.yml`}>
          regenerate workflow
        </Link>
        , which calls the Anthropic API on the server and commits the new
        MDX back to the branch.
      </p>

      <section style={{ marginTop: 32 }}>
        <p className="label" style={{ marginBottom: 12 }}>
          regenerate a new date (daily)
        </p>
        <CopyCommand command={`gh workflow run regenerate.yml -R ${REPO} -f date=$(date -u +%F) -f kind=daily`} />
      </section>

      <section style={{ marginTop: 32 }}>
        <p className="label" style={{ marginBottom: 12 }}>
          regenerate Sunday digest
        </p>
        <CopyCommand command={`gh workflow run regenerate.yml -R ${REPO} -f date=$(date -u +%F) -f kind=weekly`} />
      </section>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          per-issue regenerate commands
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {all.map((a) => {
            const kind = a.type === "weekly" ? "weekly" : "daily";
            return (
              <li
                key={a.slug}
                className="entry-row entry-row--cmd"
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <Link
                  href={`/articles/${a.slug}`}
                  className="label"
                  style={{ borderBottom: "none" }}
                >
                  {a.date}{" "}
                  {a.type === "weekly" && (
                    <span style={{ color: "var(--accent-magenta)" }}>
                      ·w
                    </span>
                  )}
                </Link>
                <Link
                  href={`/articles/${a.slug}`}
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--ink-primary)",
                  }}
                >
                  {a.title}
                </Link>
                <CopyCommand
                  command={`gh workflow run regenerate.yml -R ${REPO} -f date=${a.date} -f kind=${kind}`}
                />
              </li>
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
    </section>
  );
}
