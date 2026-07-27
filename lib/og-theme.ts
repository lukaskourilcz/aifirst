// Shared palette and chrome for the OpenGraph images. Mirrors the CSS
// custom properties in globals.css, but next/og needs literal values.
//
// Keep these in step with the palette block in app/globals.css — the trailing
// comments name the token each one copies. `dim` and `muted` label metadata on
// `bg`, so they carry the same 4.5:1 requirement as their CSS counterparts;
// the previous #88909d measured 2.9:1 against this background.
export const OG = {
  bg: "#f5f5f1", // --color-canvas
  ink: "#17191c", // --color-ink-black
  muted: "#2c3035", // --color-carbon
  dim: "#60666d", // --color-slate
  cyan: "#1d52de", // --color-blueprint-blue
  magenta: "#a54829", // --color-rust
  panel: "#fffdf8", // --color-paper
  fontMono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
