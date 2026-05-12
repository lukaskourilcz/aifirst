import { SearchPalette } from "@/components/SearchPalette";
import { buildSearchIndex } from "@/lib/content";

export const dynamic = "force-static";
export const metadata = { title: "Search" };

export default async function SearchPage() {
  const index = await buildSearchIndex();
  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">search</p>
      <h1>Find a transmission.</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
        Press <kbd>⌘K</kbd> (or <kbd>/</kbd>) anywhere on the site to open the
        palette. Or use the button below.
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
        <SearchPalette index={index} />
      </div>

      <section style={{ marginTop: 64 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          full index ({index.length})
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {index.map((e) => (
            <li
              key={e.slug}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid var(--hairline)",
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 16,
              }}
            >
              <a
                href={`/articles/${e.slug}`}
                className="label"
                style={{ borderBottom: "none" }}
              >
                {e.date}
              </a>
              <a
                href={`/articles/${e.slug}`}
                style={{ fontSize: "1rem", color: "var(--ink-primary)" }}
              >
                {e.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
