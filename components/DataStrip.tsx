type Props = {
  date: string;
  sourceCount: number;
};

export function DataStrip({ date, sourceCount }: Props) {
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
          gap: 32,
          padding: "8px 24px",
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
        }}
      >
        <span>
          <span style={{ color: "var(--accent-cyan)" }}>●</span> issue {date}
        </span>
        <span>sources {String(sourceCount).padStart(2, "0")}</span>
        <span>model claude-opus-4-7</span>
      </div>
    </div>
  );
}
