import type { ReactNode } from "react";
import { TagChip } from "./TagChip";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  date: string;
  title: string;
  dek: string;
  tags?: string[];
  illustration: { path: string; alt: string };
  locale: Locale;
  children?: ReactNode;
};

function issueStamp(date: string): { vol: string; no: string } {
  const [y, m, d] = date.split("-");
  return { vol: `vol. ${y ?? ""}`, no: `${m ?? ""}.${d ?? ""}` };
}

export function HomeCover({
  date,
  title,
  dek,
  tags,
  illustration,
  locale,
  children,
}: Props) {
  const t = dict(locale);
  const { vol, no } = issueStamp(date);

  return (
    <section
      className="home-cover container"
      style={{ paddingTop: 32, paddingBottom: 24 }}
    >
      <div className="home-cover__grid">
        <div className="home-cover__edit enter enter-1">
          <div className="home-cover__nameplate">
            <span className="label label--accent">{vol}</span>
            <span aria-hidden className="home-cover__bullet" />
            <span className="label">№ {no}</span>
            <span aria-hidden className="home-cover__bullet" />
            <span className="label">{t.home.dailyIssue}</span>
          </div>
          <h1 className="home-cover__title">{title}</h1>
          <p className="home-cover__dek">{dek}</p>
          {tags?.length ? (
            <ul className="home-cover__tags">
              {tags.map((tag) => (
                <li key={tag}>
                  <TagChip tag={tag} locale={locale} />
                </li>
              ))}
            </ul>
          ) : null}
          {children}
        </div>

        <figure className="home-cover__art enter enter-2">
          <span aria-hidden className="home-cover__corner home-cover__corner--tl" />
          <span aria-hidden className="home-cover__corner home-cover__corner--tr" />
          <span aria-hidden className="home-cover__corner home-cover__corner--bl" />
          <span aria-hidden className="home-cover__corner home-cover__corner--br" />
          <div aria-hidden className="home-cover__numeric">{no}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={illustration.path}
            alt={illustration.alt}
            loading="eager"
            decoding="async"
            className="home-cover__img"
          />
          <div aria-hidden className="home-cover__wash" />
          <div aria-hidden className="home-cover__scan" />
          <figcaption className="home-cover__caption">
            <span className="label label--accent">{t.common.issue}</span>{" "}
            <span className="label">{date}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
