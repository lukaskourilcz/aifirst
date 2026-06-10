// Shared palette and chrome for the OpenGraph images. Mirrors the CSS
// custom properties in globals.css, but next/og needs literal values.
export const OG = {
  bg: "#05070d",
  ink: "#e8ecff",
  muted: "#8a93b8",
  dim: "#4c5680",
  cyan: "#5cf0ff",
  magenta: "#ff4fd8",
  panel: "#121933",
  backgroundImage:
    "radial-gradient(1200px 600px at 80% -10%, rgba(92,240,255,0.18), transparent 60%), radial-gradient(1000px 500px at -10% 110%, rgba(255,79,216,0.15), transparent 60%)",
  fontMono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
