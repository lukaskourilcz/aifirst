import Link from "next/link";

type Props = {
  href: string;
  date: string;
  title: string;
  index?: number;
};

export function IssueCard({ href, date, title }: Props) {
  return (
    <Link href={href} className="post-card" aria-label={`${date} — ${title}`}>
      <div className="post-card__top">
        <span aria-hidden className="post-card__thumb" />
        <div>
          <p className="post-card__meta">{date}</p>
          <h3 className="post-card__title">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
