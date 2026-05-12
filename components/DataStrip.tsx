type Props = {
  date: string;
  sourceCount: number;
  tags?: string[];
};

export function DataStrip({ date, sourceCount, tags }: Props) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--hairline)",
        background: "rgba(10, 15, 31, 0.5)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          padding: "10px 24px",
          fontFamily: "var(--font-display)",
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
        }}
      >
        <span>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              boxShadow: "var(--glow-cyan)",
              marginRight: 10,
              transform: "translateY(-1px)",
            }}
          />
          issue {date}
        </span>
        <span>sources {String(sourceCount).padStart(2, "0")}</span>
        <span>model claude-opus-4-7</span>
        {tags?.length ? (
          <span style={{ color: "var(--accent-magenta)" }}>
            {tags.slice(0, 4).map((t) => `#${t}`).join("  ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
