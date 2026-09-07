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
  it("ships the reciprocal MMA FILES promotion", () => {
    expect(bannerSlot("today-partner-belt")?.advertiser).toBe("MMA FILES");
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
  it("ships the filled rail square", () => {
    expect(bannerSlot("rail-square")?.advertiser).toBe("MMA FILES");
    expect(bannerPlaceholder("rail-square")).toBe(false);
  });

  it("does not add a placeholder behind the partner belt", () => {
    expect(bannerSlot("today-partner-belt")?.advertiser).toBe("MMA FILES");
    expect(bannerPlaceholder("today-partner-belt")).toBe(false);
  });

  it("treats an unknown slot id as empty and unreserved", () => {
    expect(bannerSlot("no-such-slot")).toBeNull();
    expect(bannerPlaceholder("no-such-slot")).toBe(false);
  });
});

it.each(["javascript:alert(1)", "http://example.com", "https://user:pass@example.com", "/relative"])("rejects unsafe destination %s", href => { expect(parseSlot({ ...FILLED, href })).toBeNull(); });
it.each(["/images/banners/../private.svg", "/images/banners/%2e%2e/x.svg", "/images/banners/x.svg?query"])("rejects unsafe asset %s", src => { expect(parseSlot({ ...FILLED, desktop: { ...FILLED.desktop, src } })).toBeNull(); });
