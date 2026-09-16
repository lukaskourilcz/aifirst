import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  PARTNER_PACKAGE_IDS,
  PARTNER_PERIODS,
  SPONSOR_BLOCK_SLOT,
  formatCzk,
  hasPricedPackage,
  isSellableSlot,
  parseBooking,
  parsePackage,
  partnerBooking,
  partnerPackages,
  partnerRateCardErrors,
  partnerVatNote,
  selectPackages,
} from "../partner.js";
import { bannerInventory } from "../banner.js";
import { DICTIONARIES } from "../i18n/dictionaries.js";
import shipped from "../../config/partner.json";

const PACKAGE = {
  id: "belt",
  slot: "today-partner-belt",
  priceCzk: null,
  period: "month",
};

describe("the shipped rate card", () => {
  it("validates against its own contract", () => {
    expect(partnerRateCardErrors(shipped)).toEqual([]);
  });

  it("offers only packages the magazine can actually render", () => {
    const packages = partnerPackages();
    expect(packages.length).toBeGreaterThan(0);
    for (const entry of packages) {
      expect(isSellableSlot(entry.slot)).toBe(true);
      expect(PARTNER_PACKAGE_IDS).toContain(entry.id);
      expect(PARTNER_PERIODS).toContain(entry.period);
    }
  });

  it("carries no price it was not given", () => {
    for (const entry of partnerPackages()) {
      if (entry.priceCzk === null) continue;
      expect(Number.isSafeInteger(entry.priceCzk)).toBe(true);
      expect(entry.priceCzk).toBeGreaterThan(0);
    }
  });

  it("ships the honest empty states while the owner has decided nothing", () => {
    // These move the day the owner fills `config/partner.json`; until then the
    // page must render "price on request" and no booking button at all.
    expect(hasPricedPackage(partnerPackages())).toBe(false);
    expect(partnerBooking()).toBeNull();
    expect(partnerVatNote()).toBe("");
  });
});

describe("parsePackage", () => {
  it("accepts a complete package", () => {
    expect(parsePackage(PACKAGE)).toEqual(PACKAGE);
  });

  it("accepts the in-edition sponsor block, which is not a banner slot", () => {
    expect(parsePackage({ ...PACKAGE, slot: SPONSOR_BLOCK_SLOT })?.slot).toBe(SPONSOR_BLOCK_SLOT);
  });

  it("accepts a whole positive price", () => {
    expect(parsePackage({ ...PACKAGE, priceCzk: 6900 })?.priceCzk).toBe(6900);
  });

  it.each(["id", "slot", "period"] as const)("refuses a package missing %s", (field) => {
    expect(parsePackage({ ...PACKAGE, [field]: undefined })).toBeNull();
  });

  it("refuses an unknown package id", () => {
    expect(parsePackage({ ...PACKAGE, id: "season" })).toBeNull();
  });

  it("refuses a slot the inventory does not declare", () => {
    expect(parsePackage({ ...PACKAGE, slot: "footer-takeover" })).toBeNull();
  });

  it("refuses an unknown period", () => {
    expect(parsePackage({ ...PACKAGE, period: "quarter" })).toBeNull();
  });

  it.each([0, -1, 1.5, "6900", Number.NaN])("refuses the price %p", (priceCzk) => {
    expect(parsePackage({ ...PACKAGE, priceCzk })).toBeNull();
  });

  it.each([null, undefined, 42, "belt", [], {}])("never throws on %p", (junk) => {
    expect(() => parsePackage(junk)).not.toThrow();
    expect(parsePackage(junk)).toBeNull();
  });
});

describe("selectPackages", () => {
  it("drops a malformed entry instead of failing the render", () => {
    expect(selectPackages([PACKAGE, { id: "rail" }, "nonsense"]).map((p) => p.id)).toEqual(["belt"]);
  });

  it("keeps the first entry when an id is configured twice", () => {
    const picked = selectPackages([
      { ...PACKAGE, priceCzk: 2900 },
      { ...PACKAGE, priceCzk: 9900 },
    ]);
    expect(picked).toHaveLength(1);
    expect(picked[0]?.priceCzk).toBe(2900);
  });

  it("reads a non-array as no packages", () => {
    expect(selectPackages({ belt: PACKAGE })).toEqual([]);
  });
});

describe("parseBooking", () => {
  it("accepts an https storefront and shows its host", () => {
    expect(parseBooking({ kind: "external", href: "https://example.com/dneskai" })).toEqual({
      kind: "external",
      href: "https://example.com/dneskai",
      display: "example.com",
    });
  });

  it("accepts a mailbox and shows the address", () => {
    expect(parseBooking({ kind: "email", href: "mailto:partner@example.com" })).toEqual({
      kind: "email",
      href: "mailto:partner@example.com",
      display: "partner@example.com",
    });
  });

  it("reads the shipped none state as no destination", () => {
    expect(parseBooking({ kind: "none", href: "" })).toBeNull();
  });

  it.each([
    { kind: "external", href: "http://example.com" },
    { kind: "external", href: "https://user:pass@example.com" },
    { kind: "external", href: "not a url" },
    { kind: "external", href: 42 },
    { kind: "email", href: "partner@example.com" },
    { kind: "email", href: "mailto:partner@example" },
    { kind: "calendly", href: "https://example.com" },
    { href: "https://example.com" },
  ])("refuses %p", (value) => {
    expect(parseBooking(value)).toBeNull();
  });

  it.each([null, undefined, 42, "https://example.com", []])("never throws on %p", (junk) => {
    expect(() => parseBooking(junk)).not.toThrow();
    expect(parseBooking(junk)).toBeNull();
  });
});

describe("formatCzk", () => {
  it("groups crowns the Czech way with no decimals", () => {
    expect(formatCzk(6900, "cs")).toBe("6 900 Kč");
    expect(formatCzk(2900, "cs")).toBe("2 900 Kč");
  });
});

describe("partnerRateCardErrors", () => {
  const valid = {
    schemaVersion: "partner-rate-card/1",
    currency: "CZK",
    vatNote: "",
    booking: { kind: "none", href: "" },
    packages: [PACKAGE],
  };

  it("accepts a valid card", () => {
    expect(partnerRateCardErrors(valid)).toEqual([]);
  });

  it("names a wrong schema version and a wrong currency", () => {
    const errors = partnerRateCardErrors({ ...valid, schemaVersion: "partner/2", currency: "EUR" });
    expect(errors).toHaveLength(2);
    expect(errors.join(" ")).toContain("partner-rate-card/1");
    expect(errors.join(" ")).toContain("CZK");
  });

  it("names a package pointing at a placement that does not exist", () => {
    const errors = partnerRateCardErrors({ ...valid, packages: [{ ...PACKAGE, slot: "footer-takeover" }] });
    expect(errors.join(" ")).toContain("config/banner.json");
  });

  it("names a duplicated package", () => {
    expect(partnerRateCardErrors({ ...valid, packages: [PACKAGE, PACKAGE] }).join(" ")).toContain(
      'package "belt" is configured twice',
    );
  });

  it("names a broken booking destination", () => {
    expect(
      partnerRateCardErrors({ ...valid, booking: { kind: "external", href: "http://example.com" } }).join(" "),
    ).toContain("booking.href");
  });

  it("refuses an empty package list", () => {
    expect(partnerRateCardErrors({ ...valid, packages: [] })).toContain("packages must be a non-empty array");
  });

  it.each([null, undefined, 42, "card", []])("never throws on %p", (junk) => {
    expect(() => partnerRateCardErrors(junk)).not.toThrow();
  });
});

describe("the rate card and the reader copy agree", () => {
  // A placement with no copy is dropped by `PartnerRateCard`, so a slot added
  // to `config/banner.json` without a dictionary entry would quietly vanish
  // from the inventory a partner reads. It fails here instead.
  const placements = [...bannerInventory().slots.map((slot) => slot.id), SPONSOR_BLOCK_SLOT];

  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    it(`names every placement in ${locale}`, () => {
      const slots: Record<string, { name: string; where: string } | undefined> = dictionary.partner.slots;
      for (const id of placements) {
        expect(slots[id]?.name, `${id} has no name in ${locale}`).toBeTruthy();
        expect(slots[id]?.where, `${id} has no location in ${locale}`).toBeTruthy();
      }
    });

    it(`describes every package in ${locale}`, () => {
      for (const id of PARTNER_PACKAGE_IDS) {
        const copy = dictionary.partner.packages[id];
        expect(copy.name).toBeTruthy();
        expect(copy.summary).toBeTruthy();
        expect(copy.includes.length).toBeGreaterThan(0);
      }
    });

    it(`writes the partner page without an em-dash in ${locale}`, () => {
      expect(JSON.stringify(dictionary.partner)).not.toContain("—");
    });
  }
});

describe("the partner surface stays static", () => {
  const files = [
    "lib/partner.ts",
    "components/editorial/PartnerRateCard.tsx",
    "app/[lang]/partner/page.tsx",
  ].map((file) => [file, fs.readFileSync(path.join(process.cwd(), file), "utf8")] as const);

  it.each(files)("%s adds no client boundary", (_file, source) => {
    expect(source).not.toContain('"use client"');
  });

  it.each(files)("%s stays reproducible", (_file, source) => {
    expect(source).not.toMatch(/new Date\(|Date\.now\(|Math\.random\(/);
  });

  it.each(files)("%s embeds no third-party booking script", (_file, source) => {
    expect(source).not.toMatch(/<script|<iframe|<form/);
  });
});
