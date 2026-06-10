import Link from "next/link";
import { type Locale, localePath } from "@/lib/i18n/config";

export function TagChip({
  tag,
  count,
  locale,
}: {
  tag: string;
  count?: number;
  locale: Locale;
}) {
  return (
    <Link
      href={localePath(locale, `/tags/${encodeURIComponent(tag)}`)}
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
