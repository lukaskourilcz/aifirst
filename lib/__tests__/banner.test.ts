import { describe, it, expect } from "vitest";
import { bannerSlot, parseSlot } from "../banner.js";

const FILLED = {
  active: true,
  advertiser: "devShark",
  href: "https://example.com",
  alt: "devShark",
  desktop: { src: "/images/banners/devshark-728x90.webp", width: 728, height: 90 },
  mobile: { src: "/images/banners/devshark-320x100.webp", width: 320, height: 100 },
};

describe("bannerSlot", () => {
  it("ships empty: the committed config activates nothing", () => {
    expect(bannerSlot("today-partner-belt")).toBeNull();
  });

  it("returns null for a slot that does not exist", () => {
    expect(bannerSlot("no-such-slot")).toBeNull();
  });
});

describe("parseSlot", () => {
  it("accepts a complete active slot", () => {
    expect(parseSlot(FILLED)).toEqual(FILLED_RESULT);
  });

  it("refuses an inactive slot even when complete", () => {
    expect(parseSlot({ ...FILLED, active: false })).toBeNull();
  });

  it.each(["advertiser", "href", "alt", "desktop", "mobile"] as const)(
    "refuses a slot missing %s",
    (field) => {
      expect(parseSlot({ ...FILLED, [field]: null })).toBeNull();
    },
  );

  it.each(["advertiser", "href", "alt"] as const)("refuses an empty %s", (field) => {
    expect(parseSlot({ ...FILLED, [field]: "" })).toBeNull();
  });

  it("refuses a creative hosted anywhere but /images/banners/", () => {
    expect(
      parseSlot({ ...FILLED, desktop: { ...FILLED.desktop, src: "https://cdn.example.com/a.webp" } }),
    ).toBeNull();
    expect(
      parseSlot({ ...FILLED, mobile: { ...FILLED.mobile, src: "/uploads/a.webp" } }),
    ).toBeNull();
  });

  it("refuses a creative without usable dimensions", () => {
    expect(parseSlot({ ...FILLED, desktop: { src: FILLED.desktop.src, width: 728 } })).toBeNull();
    expect(
      parseSlot({ ...FILLED, mobile: { ...FILLED.mobile, width: 0 } }),
    ).toBeNull();
    expect(
      parseSlot({ ...FILLED, mobile: { ...FILLED.mobile, height: Number.NaN } }),
    ).toBeNull();
  });

  it("never throws on junk", () => {
    for (const junk of [null, undefined, 42, "banner", [], {}]) {
      expect(() => parseSlot(junk)).not.toThrow();
      expect(parseSlot(junk)).toBeNull();
    }
  });
});

const FILLED_RESULT = {
  advertiser: FILLED.advertiser,
  href: FILLED.href,
  alt: FILLED.alt,
  desktop: FILLED.desktop,
  mobile: FILLED.mobile,
};
