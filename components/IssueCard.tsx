import Link from "next/link";

type Props = {
  href: string;
  date: string;
  title: string;
  index?: number;
};

// Editorial tile: date eyebrow, headline, hairline divider. No accent border,
// no chevron, no number. Photo space is reserved by the parent layout.
export function IssueCard({ href, date, title }: Props) {
  return (
    <Link
      href={href}
      className="feature-tile"
      aria-label={`${date} — ${title}`}
      style={{ borderBottom: "none" }}
    >
      <span aria-hidden className="feature-tile__photo" />
      <span className="feature-tile__date">{date}</span>
      <span className="feature-tile__title">{title}</span>
    </Link>
  );
}
