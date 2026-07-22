// Shared semantic palette for deterministic Open Graph images. Mirrors the
// public design tokens, but next/og needs literal values.
export const OG = {
  page: "#f5f5f1",
  paper: "#fffdf8",
  ink: "#17191c",
  carbon: "#2c3035",
  slate: "#60666d",
  fog: "#d9dadd",
  accent: "#1d52de",
  complete: "#17785a",
  correction: "#a54829",
  fontEditorial: 'Georgia, "Times New Roman", serif',
  fontInterface: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontMono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
