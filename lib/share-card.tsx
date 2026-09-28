import { ImageResponse } from "next/og";
import { getArticle } from "./content";
import { OG } from "./og-theme";
import { brand } from "./brand";
import { ogLogo } from "./og-logo";
import { DEFAULT_LOCALE } from "./i18n/config";
import { czechNumericDate } from "./weeks";
import { topicLabels } from "./labels";

// One renderer for every edition card: the Open Graph image and the social
// formats the marketing plan posts (issue #99). All are drawn at build time by
// next/og from the edition's own title, dek, date and topics; no photograph,
// no model, no network.

export const SHARE_FORMATS = {
  /** Open Graph / link previews. */
  og: { width: 1200, height: 630 },
  /** Instagram feed post, 4:5. */
  feed: { width: 1080, height: 1350 },
  /** Instagram and Threads story, 9:16. */
  story: { width: 1080, height: 1920 },
  /** 16:9 feed enclosure (RSS readers, Seznam Newsfeed). */
  wide: { width: 1280, height: 720 },
} as const;

export type ShareFormat = keyof typeof SHARE_FORMATS;

/** The file segment of a static share image route: `feed.png` → `feed`. */
export const SHARE_IMAGE_FILES = {
  "og.png": "og",
  "feed.png": "feed",
  "story.png": "story",
  "wide.png": "wide",
} as const satisfies Record<string, ShareFormat>;

export type ShareImageFile = keyof typeof SHARE_IMAGE_FILES;

export function isShareImageFile(value: string): value is ShareImageFile {
  return Object.prototype.hasOwnProperty.call(SHARE_IMAGE_FILES, value);
}

/**
 * Root-relative URL of an edition's card in a format. The Open Graph card is
 * `share/og.png` too: an `opengraph-image` metadata file inside a dynamic
 * segment is served under a hashed name, so the old
 * `/articles/<slug>/opengraph-image` URL the article page pointed at was a 404.
 */
export function shareImagePath(slug: string, format: ShareFormat): string {
  return `/articles/${slug}/share/${format}.png`;
}

type Scale = {
  padding: number;
  logo: number;
  meta: number;
  kicker: number;
  title: number;
  titleTracking: number;
  dek: number;
  gap: number;
  /** Instagram and Threads cover the top and bottom of a story with their own UI. */
  safeY: number;
  dekLines: number;
};

const SCALES: Record<ShareFormat, Scale> = {
  og: { padding: 64, logo: 36, meta: 18, kicker: 16, title: 64, titleTracking: -2.5, dek: 26, gap: 28, safeY: 0, dekLines: 3 },
  wide: { padding: 64, logo: 40, meta: 20, kicker: 18, title: 68, titleTracking: -2.5, dek: 28, gap: 28, safeY: 0, dekLines: 3 },
  feed: { padding: 88, logo: 48, meta: 24, kicker: 22, title: 84, titleTracking: -3, dek: 34, gap: 40, safeY: 0, dekLines: 6 },
  story: { padding: 88, logo: 52, meta: 26, kicker: 24, title: 92, titleTracking: -3, dek: 38, gap: 44, safeY: 220, dekLines: 7 },
};

/** Trim a dek to roughly `lines` lines of a card, at a word boundary. */
function fitDek(dek: string, charsPerLine: number, lines: number): string {
  const max = charsPerLine * lines;
  if (dek.length <= max) return dek;
  const cut = dek.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,;:–-]+$/u, "")}…`;
}

export type ShareCardInput = {
  title: string;
  dek: string;
  date: string;
  tags: string[];
};

// Czech typography glues one-letter words with U+00A0, which the card font
// draws as a double-width gap. The cards are images, so a plain space is right.
const plain = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");

export function shareCard(raw: ShareCardInput, format: ShareFormat) {
  const input = { ...raw, title: plain(raw.title), dek: plain(raw.dek) };
  const size = SHARE_FORMATS[format];
  const s = SCALES[format];
  const logo = ogLogo(s.logo);
  const date = input.date ? czechNumericDate(input.date) : "";
  const tags = topicLabels(input.tags).slice(0, format === "og" || format === "wide" ? 4 : 3);
  const charsPerLine = Math.floor((size.width - 2 * s.padding) / (s.dek * 0.52));
  const dek = input.dek ? fitDek(input.dek, charsPerLine, s.dekLines) : "";
  const vertical = format === "feed" || format === "story";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${s.padding + s.safeY}px ${s.padding}px`,
        backgroundColor: OG.paper,
        color: OG.ink,
        fontFamily: OG.fontInterface,
        border: `1px solid ${OG.fog}`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: vertical ? 20 : 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={logo.src} alt={brand.name} width={logo.width} height={logo.height} />
        <div
          style={{
            display: "flex",
            fontSize: s.meta,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: OG.slate,
            fontFamily: OG.fontMono,
          }}
        >
          vydání {date}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: s.gap }}>
        <div
          style={{
            display: "flex",
            fontSize: s.kicker,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: OG.accent,
            fontWeight: 700,
          }}
        >
          hlavní téma
        </div>
        <div
          style={{
            display: "flex",
            fontSize: s.title,
            lineHeight: 1.02,
            letterSpacing: s.titleTracking,
            color: OG.ink,
            fontFamily: OG.fontEditorial,
            fontWeight: 700,
          }}
        >
          {input.title}
        </div>
        {dek ? (
          <div
            style={{
              display: "flex",
              fontSize: s.dek,
              lineHeight: 1.3,
              color: OG.slate,
              fontFamily: OG.fontInterface,
            }}
          >
            {dek}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: s.kicker,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: OG.slate,
          borderTop: `2px solid ${OG.borderInk}`,
          paddingTop: vertical ? 32 : 24,
        }}
      >
        <div style={{ display: "flex", columnGap: 18, rowGap: 8, color: OG.accent, flexWrap: "wrap" }}>
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The edition card for `slug` as a PNG response; the brand card when the slug is unknown. */
export async function editionCardResponse(slug: string, format: ShareFormat): Promise<ImageResponse> {
  const article = await getArticle(slug, DEFAULT_LOCALE);
  const input: ShareCardInput = {
    title: article?.frontmatter.title ?? brand.name,
    dek: article?.frontmatter.dek ?? "",
    date: article?.frontmatter.date ?? "",
    tags: article?.frontmatter.tags ?? [],
  };
  return new ImageResponse(shareCard(input, format), SHARE_FORMATS[format]);
}
