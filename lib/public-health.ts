import { addDays, isoWeekday } from "./weeks";

export type PublicHealthStatus = "healthy" | "degraded" | "stale" | "failed";

export function classifyPublicHealth(ageHours: number | null, degraded = false): PublicHealthStatus {
  if (ageHours === null) return "failed";
  if (ageHours > 48) return "stale";
  return degraded ? "degraded" : "healthy";
}

/**
 * Publishing days (Monday to Friday) after `latestEdition`, up to and
 * including `anchor`. Weekends never count as missed.
 */
export function missedPublishingDays(latestEdition: string, anchor: string): number {
  let missed = 0;
  for (let day = addDays(latestEdition, 1); day <= anchor; day = addDays(day, 1)) {
    if (isoWeekday(day) <= 5) missed += 1;
  }
  return missed;
}

/**
 * The reader-safe status without a clock: measured against the newest board
 * record, so the page says the same thing on every build of the same content.
 * One missed weekday is a normal skipped day; more than one is stale.
 */
export function publicationStatus(latestEdition: string | null, anchor: string | null): PublicHealthStatus {
  if (latestEdition === null) return "failed";
  const missed = anchor && anchor > latestEdition ? missedPublishingDays(latestEdition, anchor) : 0;
  return missed > 1 ? "stale" : "healthy";
}
