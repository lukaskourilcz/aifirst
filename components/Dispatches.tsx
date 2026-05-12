import type { Dispatch } from "@/lib/content";

export function Dispatches({ items }: { items: Dispatch[] }) {
  if (!items?.length) return null;
  return (
    <section
      aria-label="Dispatches"
      style={{
        margin: "72px 0 0",
        paddingTop: 40,
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p className="label label--accent" style={{ margin: 0 }}>
          dispatches
        </p>
        <h2 style={{ margin: "6px 0 0", color: "var(--ink-primary)" }}>
          Notes from elsewhere on the field.
        </h2>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {items.map((d, i) => (
          <li
            key={i}
            style={{
              position: "relative",
              padding: 20,
              border: "1px solid var(--hairline)",
              background:
                "linear-gradient(180deg, rgba(18,25,51,0.55), rgba(10,15,31,0.4))",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -1,
                left: -1,
                width: 16,
                height: 16,
                borderTop: "1px solid var(--accent-cyan)",
                borderLeft: "1px solid var(--accent-cyan)",
              }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 16,
                height: 16,
                borderBottom: "1px solid var(--accent-magenta)",
                borderRight: "1px solid var(--accent-magenta)",
              }}
            />
            <p
              className="label"
              style={{ color: "var(--accent-cyan)", marginBottom: 8 }}
            >
              dispatch · 0{i + 1}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                lineHeight: 1.25,
                margin: "0 0 12px",
                color: "var(--ink-primary)",
              }}
            >
              {d.title}
            </h3>
            <p
              style={{
                color: "var(--ink-muted)",
                fontSize: "0.95rem",
                margin: 0,
              }}
            >
              {d.body}
            </p>
            {d.source_url && (
              <p style={{ margin: "12px 0 0" }}>
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label"
                  style={{ color: "var(--accent-cyan)" }}
                >
                  source ↗
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
