import Link from "next/link";
import type { ReactNode } from "react";
import { czechNumericDate } from "@/lib/weeks";

type Ratio = "3/2" | "2/1" | "1/1";

const RATIO_DIMENSIONS: Record<Ratio, { width: number; height: number }> = {
  "3/2": { width: 480, height: 320 },
  "2/1": { width: 1600, height: 800 },
  "1/1": { width: 320, height: 320 },
};

/**
 * A photograph at a fixed ratio, or — when the article has none, or only a
 * drawn plate — a labelled box at the same ratio so nothing shifts and nobody
 * mistakes the gap for missing content. Always writes width and height; lazy
 * unless the caller says the image is above the fold.
 */
export function ImageOrFallback({
  src,
  ratio,
  date,
  eager = false,
  className,
}: {
  src: string | null | undefined;
  ratio: Ratio;
  /** Shown in the fallback: „bez fotografie · 22. 9. 2026". */
  date?: string;
  eager?: boolean;
  className?: string;
}) {
  const { width, height } = RATIO_DIMENSIONS[ratio];
  const classes = ["img-slot", `img-slot--${ratio.replace("/", "-")}`, className].filter(Boolean).join(" ");
  if (!src || src.toLowerCase().endsWith(".svg")) {
    return (
      <span className={`${classes} img-fallback`} aria-hidden="true">
        {ratio !== "1/1" ? (
          <span className="meta img-fallback__text">bez fotografie{date ? ` · ${czechNumericDate(date)}` : ""}</span>
        ) : null}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={classes}
    />
  );
}

/**
 * The round-2 card, one anatomy for every list on the site. `row`: a 3:2
 * image left (240 px; 280 px with `wide`), then label, serif title and a
 * two-line dek. `cover`: the image above. `compact`: title and label with a
 * square on the right. `band`: the photo with the label and a Grotesk
 * headline set white on the ink band, as the front-page lead does. The whole
 * card is one link; the image is lazy unless `eager`.
 */
export function Card({
  href,
  title,
  titleLang,
  label,
  dek,
  image,
  date,
  variant = "row",
  wide = false,
  headingLevel = 3,
  titleSize = 2,
  square,
  labelAfter = false,
  eager = false,
}: {
  href: string;
  title: string;
  titleLang?: string;
  label?: ReactNode;
  dek?: string;
  image?: string | null;
  date?: string;
  variant?: "row" | "cover" | "compact" | "band";
  wide?: boolean;
  headingLevel?: 2 | 3;
  titleSize?: 1 | 2 | 3;
  /** Compact only: the square's size, 136/120/96/88/64/56 px (88 by default). */
  square?: 136 | 120 | 96 | 88 | 64 | 56;
  /** Put the label under the title (archive rows). */
  labelAfter?: boolean;
  /** Above the fold: load the image eagerly. */
  eager?: boolean;
}) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  const ratio: Ratio = variant === "compact" ? "1/1" : "3/2";
  if (variant === "band") {
    return (
      <Link href={href} className="card card--band lead__media">
        <ImageOrFallback src={image} ratio="3/2" date={date} eager={eager} className="card__image" />
        <span className="lead__band card__band">
          {label ? <span className="label lead__section">{label}</span> : null}
          <Title className="lead__title card__band-title" lang={titleLang}>{title}</Title>
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`card card--${variant}${wide ? " card--wide" : ""}${square ? ` card--sq-${square}` : ""}`}
    >
      <ImageOrFallback src={image} ratio={ratio} date={date} eager={eager} className="card__image" />
      <span className="card__copy">
        {label && !labelAfter ? <span className="label label--muted card__label">{label}</span> : null}
        <Title className={`h-serif h-serif--${titleSize} card__title`} lang={titleLang}>{title}</Title>
        {label && labelAfter ? <span className="label label--muted card__label">{label}</span> : null}
        {dek && (variant !== "compact" || (square ?? 0) >= 120) ? <span className="card__dek" lang={titleLang}>{dek}</span> : null}
      </span>
    </Link>
  );
}

/** A compact article row in a list: title, date, a square on the right. */
export function ArticleRow({
  article,
  href,
  square = 64,
}: {
  article: { slug: string; title: string; date: string; lang?: string; heroPhoto?: string };
  href: string;
  square?: 136 | 120 | 96 | 88 | 64 | 56;
}) {
  return (
    <li className="row-compact">
      <Card
        variant="compact"
        square={square}
        href={href}
        title={article.title}
        titleLang={article.lang === "en" ? "en" : undefined}
        label={<span className="meta"><time dateTime={article.date}>{czechNumericDate(article.date)}</time></span>}
        image={article.heroPhoto}
        titleSize={3}
      />
    </li>
  );
}
