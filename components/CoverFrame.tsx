import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  locale: Locale;
};

// Photo-led cover: a clean photograph with an editorial caption below.
// 0 radius on the figure, 8px on the photo (per Monocle photo card rule).
// No corner brackets, no glow — just paper.
export function CoverFrame({ src, alt, priority, locale }: Props) {
  return (
    <figure style={{ margin: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "3 / 2",
          objectFit: "cover",
          borderRadius: "var(--radius-photo)",
          background: "var(--color-pull-quote-gray)",
        }}
      />
      <figcaption
        style={{
          marginTop: 8,
          fontFamily: "var(--font-plantin)",
          fontSize: "var(--text-caption)",
          letterSpacing: "0.075em",
          textTransform: "uppercase",
          color: "var(--color-caption-gray)",
        }}
      >
        {dict(locale).article.coverCaption}
      </figcaption>
    </figure>
  );
}
