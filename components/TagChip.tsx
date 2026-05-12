import Link from "next/link";

export function TagChip({ tag, count }: { tag: string; count?: number }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        fontFamily: "var(--font-display)",
        fontSize: "0.7rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--accent-cyan)",
        background: "rgba(92, 240, 255, 0.06)",
        border: "1px solid var(--hairline)",
        borderRadius: 2,
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <span aria-hidden style={{ color: "var(--accent-magenta)" }}>#</span>
      {tag}
      {typeof count === "number" && (
        <span style={{ color: "var(--ink-muted)" }}>· {count}</span>
      )}
    </Link>
  );
}
