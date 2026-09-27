import { describe, expect, it } from "vitest";
import { classifyPublicHealth, missedPublishingDays, publicationStatus } from "../public-health";

describe("public health classification", () => {
  it("uses the documented four-state model", () => {
    expect(classifyPublicHealth(2)).toBe("healthy");
    expect(classifyPublicHealth(2, true)).toBe("degraded");
    expect(classifyPublicHealth(72)).toBe("stale");
    expect(classifyPublicHealth(null)).toBe("failed");
  });
});

describe("publishing-day freshness", () => {
  it("does not count a weekend as missed", () => {
    // Friday edition, Sunday anchor.
    expect(missedPublishingDays("2026-09-25", "2026-09-27")).toBe(0);
    expect(publicationStatus("2026-09-25", "2026-09-27")).toBe("healthy");
  });

  it("tolerates one missed weekday and flags two", () => {
    expect(publicationStatus("2026-09-25", "2026-09-28")).toBe("healthy");
    expect(missedPublishingDays("2026-09-25", "2026-09-29")).toBe(2);
    expect(publicationStatus("2026-09-25", "2026-09-29")).toBe("stale");
  });

  it("fails without any edition", () => {
    expect(publicationStatus(null, "2026-09-29")).toBe("failed");
  });
});
