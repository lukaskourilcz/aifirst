import { ImageResponse } from "next/og";
import { getArticle, listArticles } from "@/lib/content";
import { OG } from "@/lib/og-theme";
import { brand } from "@/lib/brand";
import { ogLogo } from "@/lib/og-logo";
import type { Locale } from "@/lib/i18n/config";
import { czechNumericDate } from "@/lib/weeks";
import { topicLabels } from "@/lib/labels";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vydání DNESKAi";

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
  const date = article ? czechNumericDate(article.frontmatter.date) : "";
  const tags = topicLabels(article?.frontmatter.tags).slice(0, 4);
  const issueLabel = lang === "cs" ? "vydání" : "issue";
  const featureLabel = lang === "cs" ? "hlavní téma" : "lead development";
  const logo = ogLogo(36);

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
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
          <img src={logo.src} alt={brand.name} width={logo.width} height={logo.height} />
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
        </div>
      </div>
    ),
    size,
  );
}
