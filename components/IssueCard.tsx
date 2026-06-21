import Link from "next/link";

type Props = {
  href: string;
  date: string;
  title: string;
  index: number;
};

export function IssueCard({ href, date, title, index }: Props) {
  return (
    <Link href={href} className="issue-card" aria-label={`${date} — ${title}`}>
      <span aria-hidden className="issue-card__num">
        {String(index).padStart(2, "0")}
      </span>
      <span className="label issue-card__date">{date}</span>
      <span className="issue-card__title">{title}</span>
      <span aria-hidden className="issue-card__arrow">↗</span>
    </Link>
  );
}
