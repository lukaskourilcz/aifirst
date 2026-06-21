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
        gap: 6,
        padding: "4px 0",
        marginRight: 12,
        fontFamily: "var(--font-plantin)",
        fontSize: "var(--text-caption)",
        fontWeight: 700,
        letterSpacing: "0.075em",
        textTransform: "uppercase",
        color: "var(--color-folio-black)",
        borderBottom: "1px solid var(--color-folio-black)",
      }}
    >
      {tag}
      {typeof count === "number" && (
        <span style={{ color: "var(--color-mute-gray)" }}>· {count}</span>
      )}
    </Link>
  );
}
