import { describe, expect, it } from "vitest";
import { classifyPublicHealth } from "../public-health";

describe("public health classification", () => {
  it("uses the documented four-state model", () => {
    expect(classifyPublicHealth(2)).toBe("healthy");
    expect(classifyPublicHealth(2, true)).toBe("degraded");
    expect(classifyPublicHealth(72)).toBe("stale");
    expect(classifyPublicHealth(null)).toBe("failed");
  });
});
