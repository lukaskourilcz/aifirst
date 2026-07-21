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
                width: 14,
                height: 4,
                backgroundColor: OG.cyan,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 20,
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
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: OG.muted,
            }}
          >
            issue {date}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: OG.cyan,
            }}
          >
            feature
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 1.05,
              letterSpacing: -1,
              color: OG.ink,
              maxWidth: 1050,
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
                color: OG.muted,
                maxWidth: 1000,
                fontFamily:
                  "system-ui, -apple-system, Segoe UI, sans-serif",
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
            letterSpacing: 4,
            textTransform: "uppercase",
            color: OG.dim,
          }}
        >
          <div style={{ display: "flex", gap: 18, color: OG.magenta }}>
            {tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>signal</span>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: bars }, (_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    width: 5,
                    height: 14,
                    backgroundColor: i < filled ? OG.cyan : OG.panel,
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
