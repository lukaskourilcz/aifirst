import Link from "next/link";
import type { ReactNode } from "react";
import { isDrawnPlate } from "@/lib/content";

/**
 * One cover card for Weekly, Archive and Related editions. Archive is a dense
 * list, so it takes the `row` layout; the others stack as `card`. Both share
 * the same anatomy, tokens and hover language — the surfaces previously had a
 * card, a row and a tile that only looked related by accident.
 *
 * Media is optional by contract. Historical and legacy issues may have no
 * image, and a card without one renders text-first with the same spacing
 * rather than reserving an empty media box.
 *
 * The image always carries explicit `width` and `height`. The crop is set in
 * CSS per surface, but the attributes give the browser the ratio before the
 * stylesheet arrives, which is what keeps the list from shifting as covers
 * load.
 */
export function CoverCard({
  href,
  title,
  kicker,
  dek,
  meta,
  media,
  mediaWidth,
  mediaHeight,
  eager = false,
  layout = "card",
  headingLevel = 3,
  children,
}: {
  href: string;
  title: string;
  kicker?: ReactNode;
  dek?: string;
  meta?: ReactNode;
  media?: string | null;
  mediaWidth: number;
  mediaHeight: number;
  eager?: boolean;
  layout?: "card" | "row";
  headingLevel?: 2 | 3;
  children?: ReactNode;
}) {
  // A delivered .svg cover arrives already composed, and the oldest ones have
  // the headline burned into the artwork. The title plate never overlaps one,
  // so the card falls back to media above copy — the same rule the hero uses.
  const overlaps = Boolean(media) && !isDrawnPlate(media);
  const Title = headingLevel === 2 ? "h2" : "h3";

  const className = [
    "cover-card",
    `cover-card--${layout}`,
    media ? "cover-card--with-media" : "cover-card--text-first",
    overlaps ? "cover-card--overlap" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={className}>
      {media ? (
        <span className="cover-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media}
            alt=""
            width={mediaWidth}
            height={mediaHeight}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        </span>
      ) : null}
      <span className="cover-card__plate">
        {kicker ? <span className="cover-card__kicker">{kicker}</span> : null}
        <Title className="cover-card__title">{title}</Title>
        {dek ? <span className="cover-card__dek">{dek}</span> : null}
        {meta ? <span className="cover-card__meta">{meta}</span> : null}
        {children}
      </span>
    </Link>
  );
}
