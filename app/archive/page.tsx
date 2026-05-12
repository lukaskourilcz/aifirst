import Link from "next/link";
import { listArticles } from "@/lib/content";

export const dynamic = "force-static";

export default async function ArchivePage() {
  const all = await listArticles();

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label">Archive</p>
      <h1>All issues</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: "2em 0 0" }}>
        {all.map((a) => (
          <li
            key={a.slug}
            style={{ padding: "16px 0", borderBottom: "1px solid var(--hairline)" }}
          >
            <Link href={`/articles/${a.slug}`} className="label" style={{ marginRight: 16 }}>
              {a.date}
            </Link>
            <Link href={`/articles/${a.slug}`} style={{ fontSize: "1.125rem" }}>
              {a.title}
            </Link>
          </li>
        ))}
        {all.length === 0 && (
          <li style={{ color: "var(--ink-muted)" }}>No issues yet.</li>
        )}
      </ul>
    </section>
  );
}
