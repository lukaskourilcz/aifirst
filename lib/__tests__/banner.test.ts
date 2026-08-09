import { describe, it, expect } from "vitest";
import { bannerPlaceholder, bannerSlot, isPlaceholderSlot, parseSlot } from "../banner.js";

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

describe("the placeholder rule", () => {
  it("reserves the box only when the slot is empty and opts in", () => {
    expect(isPlaceholderSlot({ active: false, placeholder: true })).toBe(true);
  });

  it("keeps render-null when placeholder is absent or false", () => {
    expect(isPlaceholderSlot({ active: false })).toBe(false);
    expect(isPlaceholderSlot({ active: false, placeholder: false })).toBe(false);
  });

  it("does not reserve a second box once a creative exists", () => {
    // A filled slot is its own reservation, so placeholder stops applying.
    expect(isPlaceholderSlot({ ...FILLED, placeholder: true })).toBe(false);
  });

  it("only accepts a real boolean", () => {
    for (const value of ["true", 1, {}, []]) {
      expect(isPlaceholderSlot({ active: false, placeholder: value })).toBe(false);
    }
  });

  it("never throws on junk", () => {
    for (const junk of [null, undefined, 42, "banner", [], {}]) {
      expect(() => isPlaceholderSlot(junk)).not.toThrow();
      expect(isPlaceholderSlot(junk)).toBe(false);
    }
  });
});

describe("the shipped slots", () => {
  it("ships the rail square empty but reserved", () => {
    expect(bannerSlot("rail-square")).toBeNull();
    expect(bannerPlaceholder("rail-square")).toBe(true);
  });

  it("leaves the partner belt collapsing exactly as before", () => {
    expect(bannerSlot("today-partner-belt")).toBeNull();
    expect(bannerPlaceholder("today-partner-belt")).toBe(false);
  });

  it("treats an unknown slot id as empty and unreserved", () => {
    expect(bannerSlot("no-such-slot")).toBeNull();
    expect(bannerPlaceholder("no-such-slot")).toBe(false);
  });
});
