import { ImageResponse } from "next/og";
import { OG } from "@/lib/og-theme";
import { MODELS } from "@/lib/anthropic/models";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "aifirst — a daily AI tech magazine";

export default async function Image() {
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
          backgroundImage: OG.backgroundImage,
          color: OG.ink,
          fontFamily: OG.fontMono,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 18,
              height: 18,
              backgroundColor: OG.cyan,
              transform: "rotate(45deg)",
              boxShadow: "0 0 24px rgba(92,240,255,0.7)",
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
            <span>aifirst</span>
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
            a daily ai tech magazine
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
            Signals from the frontier, every morning.
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
          <span>model · {MODELS.opus}</span>
          <span>transmission · ongoing</span>
        </div>
      </div>
    ),
    size,
  );
}
