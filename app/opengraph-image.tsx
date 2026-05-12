import { ImageResponse } from "next/og";

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
          backgroundColor: "#05070d",
          backgroundImage:
            "radial-gradient(1200px 600px at 80% -10%, rgba(92,240,255,0.18), transparent 60%), radial-gradient(1000px 500px at -10% 110%, rgba(255,79,216,0.15), transparent 60%)",
          color: "#e8ecff",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 18,
              height: 18,
              backgroundColor: "#5cf0ff",
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
            <span style={{ color: "#ff4fd8" }}>.</span>
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
              color: "#8a93b8",
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
              color: "#e8ecff",
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
            color: "#4c5680",
          }}
        >
          <span>model · claude-opus-4-7</span>
          <span>transmission · ongoing</span>
        </div>
      </div>
    ),
    size,
  );
}
