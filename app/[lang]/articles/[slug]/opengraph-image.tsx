import { ImageResponse } from "next/og";
import { getArticle, listArticles } from "@/lib/content";
import { OG } from "@/lib/og-theme";
import { signalBars } from "@/lib/helpers/signal";
import { brand } from "@/lib/brand";
import type { Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Caught Up issue";

export async function generateStaticParams() {
  const all = await listArticles();
  return all.map((a) => ({ slug: a.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const article = await getArticle(slug, lang);
  const title = article?.frontmatter.title ?? brand.name;
  const dek = article?.frontmatter.dek ?? "";
  const date = article?.frontmatter.date ?? "";
  const tags = (article?.frontmatter.tags ?? []).slice(0, 4);
  const signal = article?.frontmatter.signal_strength ?? 0;
  const { clamped, filled, bars } = signalBars(signal);
  const issueLabel = lang === "cs" ? "vydání" : "issue";
  const featureLabel = lang === "cs" ? "hlavní téma" : "lead development";
  const signalLabel = lang === "cs" ? "signál" : "signal";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          backgroundColor: OG.paper,
          color: OG.ink,
          fontFamily: OG.fontInterface,
          border: `1px solid ${OG.fog}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                width: 30,
                height: 30,
                alignItems: "flex-end",
                justifyContent: "flex-end",
                borderTop: `2px solid ${OG.ink}`,
                borderLeft: `2px solid ${OG.ink}`,
                padding: 4,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  backgroundColor: OG.accent,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                letterSpacing: -1,
                fontFamily: OG.fontEditorial,
                fontWeight: 700,
              }}
            >
              {brand.name}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: OG.slate,
              fontFamily: OG.fontMono,
            }}
          >
            {issueLabel} {date}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: OG.accent,
              fontWeight: 700,
            }}
          >
            {featureLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 0.98,
              letterSpacing: -2.5,
              color: OG.ink,
              maxWidth: 1050,
              fontFamily: OG.fontEditorial,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          {dek && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.3,
                color: OG.slate,
                maxWidth: 1000,
                fontFamily: OG.fontInterface,
              }}
            >
              {dek}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: OG.slate,
            borderTop: `2px solid ${OG.ink}`,
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: 18, color: OG.accent }}>
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>{signalLabel}</span>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: bars }, (_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    width: 5,
                    height: 14,
                    backgroundColor: i < filled ? OG.accent : OG.fog,
                  }}
                />
              ))}
            </div>
            <span style={{ color: OG.ink }}>
              {String(clamped).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
