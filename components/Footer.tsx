export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hairline)",
        marginTop: 96,
        padding: "48px 0 64px",
        background: "rgba(5, 7, 13, 0.6)",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "end",
        }}
      >
        <div>
          <p
            className="label"
            style={{ color: "var(--accent-cyan)", marginBottom: 8 }}
          >
            aifirst<span style={{ color: "var(--accent-magenta)" }}>.</span>
          </p>
          <p style={{ color: "var(--ink-muted)", margin: 0, maxWidth: "52ch" }}>
            A daily magazine about AI and technology, edited by a language
            model. Articles are generated each morning from a curated set of
            primary sources, independent analysts, and the wire.
          </p>
        </div>
        <p className="label" style={{ textAlign: "right", margin: 0 }}>
          transmission · ongoing
        </p>
      </div>
    </footer>
  );
}
