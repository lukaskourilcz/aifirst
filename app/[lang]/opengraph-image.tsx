import { ImageResponse } from "next/og";
import { OG } from "@/lib/og-theme";
import { brand } from "@/lib/brand";
import { localizedBrand } from "@/lib/brand";
import { LOCALES, type Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DNESKAi — The AI stories that actually mattered today";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const publication = localizedBrand(lang);
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
          backgroundColor: OG.page,
          color: OG.ink,
          fontFamily: OG.fontInterface,
          border: `1px solid ${OG.fog}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 34,
              height: 34,
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
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: OG.accent,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: OG.fontEditorial,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1.5,
            }}
          >
            {brand.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: OG.accent,
              fontWeight: 700,
            }}
          >
            {publication.tagline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              lineHeight: 0.98,
              letterSpacing: -3.5,
              color: OG.ink,
              maxWidth: 1000,
              fontFamily: OG.fontEditorial,
              fontWeight: 700,
            }}
          >
            {publication.promise}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: OG.slate,
            borderTop: `2px solid ${OG.ink}`,
            paddingTop: 24,
          }}
        >
          <span>{lang === "cs" ? "výběrová denní publikace" : "a selective daily publication"}</span>
          <span>{lang === "cs" ? "vychází denně" : "published daily"}</span>
        </div>
      </div>
    ),
    size,
  );
}
