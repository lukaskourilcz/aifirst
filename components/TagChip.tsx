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
      className="chip chip--dot"
      style={{ textTransform: "lowercase" }}
    >
      {tag}
      {typeof count === "number" && (
        <span style={{ color: "var(--color-slate)" }}>· {count}</span>
      )}
    </Link>
  );
}
