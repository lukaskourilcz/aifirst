import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  bannerInventory,
  bannerInventoryErrors,
  bannerPlaceholder,
  bannerSlot,
  isDeclaredSlot,
  isPlaceholderSlot,
  parseInventory,
  parseSlot,
} from "../banner.js";
import shipped from "../../config/banner.json";

/** Every TypeScript source under `dir`, so a render site cannot hide in it. */
function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (/\.tsx?$/.test(entry.name)) found.push(full);
  }
  return found;
}

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

describe("the declared inventory", () => {
  it("ships the three placements the magazine sells", () => {
    const inventory = bannerInventory();
    expect(inventory.maxPerEdition).toBe(3);
    expect(inventory.maxPerSurface).toBe(2);
    expect(inventory.slots.map((slot) => slot.id)).toEqual([
      "today-partner-belt",
      "rail-square",
      "weekly-belt",
    ]);
  });

  it("declares the Weekly belt but ships it unsold", () => {
    expect(isDeclaredSlot("weekly-belt")).toBe(true);
    expect(bannerSlot("weekly-belt")).toBeNull();
    expect(bannerPlaceholder("weekly-belt")).toBe(false);
  });

  it("treats an undeclared id as empty even when a creative exists for it", () => {
    expect(isDeclaredSlot("in-feed")).toBe(false);
    expect(bannerSlot("in-feed")).toBeNull();
    expect(bannerPlaceholder("in-feed")).toBe(false);
  });

  it("refuses an inventory that is missing, malformed or over its own cap", () => {
    expect(parseInventory(undefined)).toBeNull();
    expect(parseInventory({ maxPerEdition: 3, maxPerSurface: 2 })).toBeNull();
    expect(parseInventory({ maxPerEdition: 0, maxPerSurface: 0, slots: [DECLARED] })).toBeNull();
    // The surface cap can never be looser than the edition cap.
    expect(parseInventory({ maxPerEdition: 1, maxPerSurface: 2, slots: [DECLARED] })).toBeNull();
    // A duplicate id would let one slot be counted twice.
    expect(parseInventory({ maxPerEdition: 3, maxPerSurface: 2, slots: [DECLARED, DECLARED] })).toBeNull();
    expect(parseInventory({ maxPerEdition: 3, maxPerSurface: 2, slots: [{ id: "a", surfaces: [] }] })).toBeNull();
  });

  it("never throws on junk", () => {
    for (const junk of [null, undefined, 42, "banner", [], {}]) {
      expect(() => parseInventory(junk)).not.toThrow();
      expect(parseInventory(junk)).toBeNull();
    }
  });
});

const DECLARED = { id: "a", surfaces: ["today"] };

function fixture(over: {
  maxPerEdition?: number;
  maxPerSurface?: number;
  declared?: Array<{ id: string; surfaces: string[] }>;
  slots?: Record<string, unknown>;
}) {
  return {
    schemaVersion: "banner-slot/1",
    inventory: {
      maxPerEdition: over.maxPerEdition ?? 3,
      maxPerSurface: over.maxPerSurface ?? 2,
      slots: over.declared ?? [
        { id: "one", surfaces: ["today"] },
        { id: "two", surfaces: ["today"] },
      ],
    },
    slots: over.slots ?? { one: FILLED, two: { active: false } },
  };
}

describe("bannerInventoryErrors", () => {
  it("passes the configuration this build ships", () => {
    expect(bannerInventoryErrors(shipped)).toEqual([]);
  });

  it("passes a well-formed fixture", () => {
    expect(bannerInventoryErrors(fixture({}))).toEqual([]);
  });

  it("fails when the configuration carries more creatives than the cap", () => {
    const errors = bannerInventoryErrors(
      fixture({
        maxPerEdition: 2,
        maxPerSurface: 2,
        declared: [
          { id: "one", surfaces: ["today"] },
          { id: "two", surfaces: ["weekly"] },
          { id: "three", surfaces: ["article"] },
        ],
        slots: { one: FILLED, two: FILLED, three: FILLED },
      }),
    );
    expect(errors.some((error) => error.includes("exceed the cap of 2 per edition"))).toBe(true);
  });

  it("fails when one surface carries more creatives than the surface cap", () => {
    const errors = bannerInventoryErrors(
      fixture({
        maxPerSurface: 1,
        declared: [
          { id: "one", surfaces: ["today"] },
          { id: "two", surfaces: ["today"] },
        ],
        slots: { one: FILLED, two: FILLED },
      }),
    );
    expect(errors.some((error) => error.includes("on the today surface"))).toBe(true);
  });

  it("fails when the inventory declares more slots than the cap allows", () => {
    const errors = bannerInventoryErrors(
      fixture({
        maxPerEdition: 1,
        maxPerSurface: 1,
        declared: [
          { id: "one", surfaces: ["today"] },
          { id: "two", surfaces: ["weekly"] },
        ],
        slots: { one: { active: false }, two: { active: false } },
      }),
    );
    expect(errors).toContain("inventory declares 2 slots, more than the cap of 1 per edition");
  });

  it("fails when a configured slot is not declared", () => {
    const errors = bannerInventoryErrors(
      fixture({ slots: { one: FILLED, two: { active: false }, "in-feed": FILLED } }),
    );
    expect(errors).toContain('slot "in-feed" is not declared in inventory.slots');
  });

  it("fails when a declared slot has no entry at all", () => {
    const errors = bannerInventoryErrors(fixture({ slots: { one: FILLED } }));
    expect(errors).toContain('inventory declares "two" but slots carries no entry for it');
  });

  it("fails when the inventory block is missing or malformed", () => {
    expect(bannerInventoryErrors({ schemaVersion: "banner-slot/1", slots: {} })).not.toEqual([]);
    expect(bannerInventoryErrors({ inventory: "three", slots: {} })).not.toEqual([]);
  });

  it("fails when slots is not an object", () => {
    expect(bannerInventoryErrors({ inventory: fixture({}).inventory, slots: [] })).toContain(
      "slots must be an object keyed by slot id",
    );
  });

  it("fails on a placeholder flag that is not a boolean", () => {
    const errors = bannerInventoryErrors(
      fixture({ slots: { one: FILLED, two: { active: false, placeholder: "true" } } }),
    );
    expect(errors).toContain('slot "two": placeholder must be a boolean');
  });

  it("never throws on junk", () => {
    for (const junk of [null, undefined, 42, "banner", [], {}]) {
      expect(() => bannerInventoryErrors(junk)).not.toThrow();
    }
    expect(bannerInventoryErrors(null)).toEqual(["configuration must be an object"]);
  });
});

describe("the rendered placements", () => {
  // The cap is only real if the reader cannot be shown an id the inventory
  // does not declare, so the inventory and the render sites must agree exactly.
  const rendered = new Set<string>();
  for (const dir of ["app", "components"]) {
    for (const file of walk(path.join(process.cwd(), dir))) {
      const source = fs.readFileSync(file, "utf8");
      for (const match of source.matchAll(/<BannerSlot\s+id="([^"]+)"/g)) {
        const id = match[1];
        if (id) rendered.add(id);
      }
    }
  }

  it("renders only declared ids", () => {
    const declared = new Set(bannerInventory().slots.map((slot) => slot.id));
    expect([...rendered].filter((id) => !declared.has(id))).toEqual([]);
  });

  it("renders every declared id somewhere", () => {
    expect(bannerInventory().slots.map((slot) => slot.id).filter((id) => !rendered.has(id))).toEqual([]);
  });
});
