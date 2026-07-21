// Single source of truth for the model ids used across the pipeline and
// surfaced in the UI (masthead data strip, OG image, colophon). Kept free
// of the SDK import so it's cheap to pull into client/display code.
export const MODELS = {
  opus: "claude-opus-4-7",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001",
} as const;

export type ModelRole = "curation" | "writing" | "utility";

export function modelFor(role: ModelRole): string {
  if (role === "curation") return process.env.AIFIRST_CURATION_MODEL?.trim() || MODELS.sonnet;
  if (role === "writing") return process.env.AIFIRST_WRITING_MODEL?.trim() || MODELS.opus;
  return process.env.AIFIRST_UTILITY_MODEL?.trim() || MODELS.haiku;
}
