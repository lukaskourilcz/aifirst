import { ImageResponse } from "next/og";
import { OG } from "@/lib/og-theme";
import { brand } from "@/lib/brand";
import { localizedBrand } from "@/lib/brand";
import { LOCALES, type Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Caught Up — The AI stories that actually mattered today";

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
          backgroundColor: OG.bg,
          color: OG.ink,
          fontFamily: OG.fontMono,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 18,
              height: 4,
              backgroundColor: OG.cyan,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <span>{brand.name}</span>
            <span style={{ color: OG.magenta }}>.</span>
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
              letterSpacing: 6,
              textTransform: "uppercase",
              color: OG.muted,
            }}
          >
            {publication.tagline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              lineHeight: 1.05,
              letterSpacing: -1,
              color: OG.ink,
              maxWidth: 1000,
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
            letterSpacing: 4,
            textTransform: "uppercase",
            color: OG.dim,
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
