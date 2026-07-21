export type PublicHealthStatus = "healthy" | "degraded" | "stale" | "failed";

export function classifyPublicHealth(ageHours: number | null, degraded = false): PublicHealthStatus {
  if (ageHours === null) return "failed";
  if (ageHours > 48) return "stale";
  return degraded ? "degraded" : "healthy";
}
