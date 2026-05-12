import type { WireItem } from "@/lib/content";

export function Wire({ items }: { items: WireItem[] }) {
  if (!items?.length) return null;
  return (
    <section
      aria-label="The wire"
      style={{
        margin: "64px 0",
        padding: "20px 24px",
        background:
          "linear-gradient(90deg, rgba(92,240,255,0.04), rgba(255,79,216,0.04))",
        border: "1px solid var(--hairline)",
        borderLeft: "2px solid var(--accent-cyan)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent-cyan)",
            boxShadow: "var(--glow-cyan)",
          }}
        />
        <p className="label label--accent" style={{ margin: 0 }}>
          the wire — also today
        </p>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px 24px",
        }}
      >
        {items.map((item, i) => (
          <li
            key={item.url}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 10,
              alignItems: "baseline",
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                color: "var(--ink-dim)",
                letterSpacing: "0.18em",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{ borderBottom: "1px dashed var(--hairline)" }}
              >
                {item.title}
              </a>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink-dim)",
                  marginTop: 2,
                }}
              >
                {item.source}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
