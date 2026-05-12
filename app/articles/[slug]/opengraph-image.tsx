import { ImageResponse } from "next/og";
import { getArticle, listArticles } from "@/lib/content";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "aifirst issue";

export async function generateStaticParams() {
  const all = await listArticles();
  return all.map((a) => ({ slug: a.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const title = article?.frontmatter.title ?? "aifirst";
  const dek = article?.frontmatter.dek ?? "";
  const date = article?.frontmatter.date ?? "";
  const tags = (article?.frontmatter.tags ?? []).slice(0, 4);
  const signal = article?.frontmatter.signal_strength ?? 0;

  const bars = 12;
  const filled = Math.round(
    (Math.max(0, Math.min(100, signal)) / 100) * bars,
  );

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
          backgroundColor: "#05070d",
          backgroundImage:
            "radial-gradient(1200px 600px at 80% -10%, rgba(92,240,255,0.18), transparent 60%), radial-gradient(1000px 500px at -10% 110%, rgba(255,79,216,0.15), transparent 60%)",
          color: "#e8ecff",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
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
                height: 14,
                backgroundColor: "#5cf0ff",
                transform: "rotate(45deg)",
                boxShadow: "0 0 20px rgba(92,240,255,0.7)",
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
              <span>aifirst</span>
              <span style={{ color: "#ff4fd8" }}>.</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8a93b8",
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
              color: "#5cf0ff",
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
              color: "#e8ecff",
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
                color: "#8a93b8",
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
            color: "#4c5680",
          }}
        >
          <div style={{ display: "flex", gap: 18, color: "#ff4fd8" }}>
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
                    backgroundColor: i < filled ? "#5cf0ff" : "#121933",
                  }}
                />
              ))}
            </div>
            <span style={{ color: "#e8ecff" }}>
              {String(signal).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
