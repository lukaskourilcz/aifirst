type Source = { id: string; url: string; title: string };

export function SourcesBlock({ sources }: { sources: Source[] }) {
  if (!sources?.length) return null;
  return (
    <section
      aria-label="Sources"
      style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <p className="label" style={{ marginBottom: 16 }}>
        Sources
      </p>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 12,
          counterReset: "src",
        }}
      >
        {sources.map((s) => (
          <li
            key={s.id}
            style={{
              counterIncrement: "src",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 16,
              alignItems: "baseline",
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                color: "var(--accent-magenta)",
                letterSpacing: "0.18em",
              }}
            >
              [{String(sources.indexOf(s) + 1).padStart(2, "0")}]
            </span>
            <a href={s.url} target="_blank" rel="noreferrer noopener">
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
