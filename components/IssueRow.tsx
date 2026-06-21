import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  // Already locale-prefixed destination (e.g. localePath(locale, `/articles/x`)).
  href: string;
  date: string;
  title: string;
  // Title font size; rows tune this per page.
  titleSize?: string;
  // Title colour; defaults to the cyan link colour. Listings inside dense
  // panels (search, admin) pass the primary ink instead.
  titleColor?: string;
  // Vertical padding shorthand, e.g. "16px 0".
  padding?: string;
  // `.entry-row` modifier: "meta" adds a trailing column, "cmd" the wider
  // command layout.
  variant?: "meta" | "cmd";
  // Extra content appended inside the date link (e.g. a weekly marker).
  dateSuffix?: ReactNode;
  // Right-hand content for the trailing column (tag chips, a copy button, …).
  trailing?: ReactNode;
};

// A single date + title row in an issue listing (archive, tags, sources,
// search, admin, the home page's recent list). The grid columns live in CSS
// (`.entry-row` and its modifiers); this owns the links and per-row spacing.
export function IssueRow({
  href,
  date,
  title,
  titleSize = "1.05rem",
  titleColor,
  padding = "14px 0",
  variant,
  dateSuffix,
  trailing,
}: Props) {
  return (
    <li
      className={variant ? `entry-row entry-row--${variant}` : "entry-row"}
      style={{ padding, borderBottom: "1px solid var(--hairline)" }}
    >
      <Link href={href} className="label">
        {date}
        {dateSuffix}
      </Link>
      <Link href={href} style={{ fontSize: titleSize, color: titleColor }}>
        {title}
      </Link>
      {trailing}
    </li>
  );
}
