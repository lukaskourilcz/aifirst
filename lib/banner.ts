import raw from "@/config/banner.json";

// A banner slot is build-time configuration, not an ad network. There is no
// script, no third-party host and no tracking: a filled slot is a local image
// under `public/images/banners/` linked to one advertiser URL. Because the page
// is statically rendered from this config, a filled slot causes zero layout
// shift and an empty one renders nothing at all.
//
// The inventory is declared and capped in the same file. Only a declared slot
// can render, and `bannerInventoryErrors` fails the release gate when the
// configuration carries more creatives than the cap allows.

export type BannerCreative = { src: string; width: number; height: number };

export type BannerSlot = {
  advertiser: string;
  href: string;
  alt: string;
  desktop: BannerCreative;
  mobile: BannerCreative;
};

/** One declared placement: its id and the reader surfaces that render it. */
export type BannerInventorySlot = {
  readonly id: string;
  readonly surfaces: readonly string[];
};

/**
 * The declared sponsorship inventory. It is deliberately small and fixed:
 * `maxPerEdition` caps how many creatives the whole configuration may carry,
 * `maxPerSurface` caps how many a reader meets on one page, and `slots` is the
 * complete list of placements that exist. An id outside this list cannot render
 * even if somebody adds a creative for it, which is what makes the cap a
 * mechanism rather than a convention.
 */
export type BannerInventory = {
  readonly maxPerEdition: number;
  readonly maxPerSurface: number;
  readonly slots: readonly BannerInventorySlot[];
};

const config = raw as {
  schemaVersion: string;
  inventory?: unknown;
  slots: Record<string, unknown>;
};

/**
 * A malformed inventory reads as no inventory, and no inventory means no
 * declared slot, so every placement collapses. That is the safe direction for a
 * cap: a broken config can never widen the inventory, and `pnpm check:content`
 * fails on it long before a build reaches a reader.
 */
const EMPTY_INVENTORY: BannerInventory = { maxPerEdition: 0, maxPerSurface: 0, slots: [] };

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function inventorySlot(value: unknown): BannerInventorySlot | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { id, surfaces } = value as Record<string, unknown>;
  if (typeof id !== "string" || id.trim() === "") return null;
  if (!Array.isArray(surfaces) || surfaces.length === 0) return null;
  const named: string[] = [];
  for (const surface of surfaces) {
    if (typeof surface !== "string" || surface.trim() === "") return null;
    named.push(surface);
  }
  return { id, surfaces: named };
}

/**
 * The declared inventory, or `null` when the block is missing or malformed.
 * Never throws, for the same reason `parseSlot` never throws: it runs during
 * static render.
 */
export function parseInventory(value: unknown): BannerInventory | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { maxPerEdition, maxPerSurface, slots } = value as Record<string, unknown>;
  if (!positiveInteger(maxPerEdition) || !positiveInteger(maxPerSurface)) return null;
  if (maxPerSurface > maxPerEdition) return null;
  if (!Array.isArray(slots) || slots.length === 0) return null;

  const declared: BannerInventorySlot[] = [];
  const seen = new Set<string>();
  for (const entry of slots) {
    const slot = inventorySlot(entry);
    if (slot === null || seen.has(slot.id)) return null;
    seen.add(slot.id);
    declared.push(slot);
  }
  // The list may be longer than the cap here; that is an over-declared
  // inventory rather than a malformed one, and `bannerInventoryErrors` names it
  // precisely instead of collapsing every placement over a counting mistake.
  return { maxPerEdition, maxPerSurface, slots: declared };
}

const inventory = parseInventory(config.inventory) ?? EMPTY_INVENTORY;

/** The inventory this build ships. */
export function bannerInventory(): BannerInventory {
  return inventory;
}

/** Whether `id` is one of the placements the inventory declares. */
export function isDeclaredSlot(id: string): boolean {
  return inventory.slots.some((slot) => slot.id === id);
}

function creative(value: unknown): BannerCreative | null {
  if (typeof value !== "object" || value === null) return null;
  const { src, width, height } = value as Record<string, unknown>;
  if (typeof src !== "string" || !/^\/images\/banners\/[a-zA-Z0-9_-]+\.(svg|webp|png|jpe?g)$/.test(src)) return null;
  if (typeof width !== "number" || typeof height !== "number") return null;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return { src, width, height };
}

/**
 * One configured slot, or `null` when it is inactive, incomplete, or points
 * anywhere outside `public/images/banners/`. Anything malformed reads as empty
 * — a bad config never throws during render.
 */
export function parseSlot(value: unknown): BannerSlot | null {
  const slot = value;
  if (typeof slot !== "object" || slot === null) return null;

  const { active, advertiser, href, alt } = slot as Record<string, unknown>;
  if (active !== true) return null;
  if (typeof advertiser !== "string" || advertiser === "") return null;
  if (typeof href !== "string" || href === "") return null;
  if (typeof alt !== "string" || !alt.trim()) return null;

  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.username || url.password) return null;
  } catch { return null; }

  const desktop = creative((slot as Record<string, unknown>).desktop);
  const mobile = creative((slot as Record<string, unknown>).mobile);
  if (desktop === null || mobile === null) return null;

  return { advertiser, href, alt, desktop, mobile };
}

/**
 * The creative configured for `id`, or `null` while the slot is empty. An id
 * the inventory does not declare is empty by definition, so a creative added
 * outside the declared list is unreachable rather than an extra placement.
 */
export function bannerSlot(id: string): BannerSlot | null {
  if (!isDeclaredSlot(id)) return null;
  return parseSlot(config.slots[id]);
}

/**
 * Whether an empty slot still reserves its box.
 *
 * `placeholder: true` is what keeps the right rail the same height with and
 * without a creative, so filling the slot later shifts nothing. It only applies
 * while the slot is empty: once a real creative is configured the creative is
 * the reservation. Absent or false keeps the original render-null behaviour,
 * which is why `today-partner-belt` is unaffected.
 */
export function isPlaceholderSlot(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const slot = value as Record<string, unknown>;
  if (parseSlot(slot) !== null) return false;
  return slot.placeholder === true;
}

export function bannerPlaceholder(id: string): boolean {
  if (!isDeclaredSlot(id)) return false;
  return isPlaceholderSlot(config.slots[id]);
}

/**
 * Everything wrong with a banner configuration, as reader-independent messages.
 * `pnpm check:content` runs it over `config/banner.json` and fails the release
 * gate, so an over-cap or undeclared placement cannot reach a build. It takes
 * the whole configuration object rather than the module-level import so a test
 * can feed it a fixture.
 */
export function bannerInventoryErrors(input: unknown): string[] {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return ["configuration must be an object"];
  }
  const value = input as Record<string, unknown>;
  const errors: string[] = [];

  const declared = parseInventory(value.inventory);
  if (declared === null) {
    errors.push(
      "inventory must carry maxPerEdition and maxPerSurface as positive integers with maxPerSurface no larger than maxPerEdition, and a non-empty slots list of unique { id, surfaces } entries",
    );
  } else if (declared.slots.length > declared.maxPerEdition) {
    errors.push(
      `inventory declares ${declared.slots.length} slots, more than the cap of ${declared.maxPerEdition} per edition`,
    );
  }

  const slots = value.slots;
  if (typeof slots !== "object" || slots === null || Array.isArray(slots)) {
    errors.push("slots must be an object keyed by slot id");
    return errors;
  }
  const configured = Object.entries(slots as Record<string, unknown>);

  for (const [id, slot] of configured) {
    if (typeof slot !== "object" || slot === null || Array.isArray(slot)) {
      errors.push(`slot "${id}" must be an object`);
      continue;
    }
    const placeholder = (slot as Record<string, unknown>).placeholder;
    if (placeholder !== undefined && typeof placeholder !== "boolean") {
      errors.push(`slot "${id}": placeholder must be a boolean`);
    }
  }

  if (declared === null) return errors;

  const declaredIds = new Set(declared.slots.map((slot) => slot.id));
  for (const [id] of configured) {
    if (!declaredIds.has(id)) errors.push(`slot "${id}" is not declared in inventory.slots`);
  }
  for (const slot of declared.slots) {
    if (!Object.prototype.hasOwnProperty.call(slots, slot.id)) {
      errors.push(`inventory declares "${slot.id}" but slots carries no entry for it`);
    }
  }

  const filled = new Set(
    configured.filter(([, slot]) => parseSlot(slot) !== null).map(([id]) => id),
  );
  if (filled.size > declared.maxPerEdition) {
    errors.push(
      `${filled.size} filled creatives exceed the cap of ${declared.maxPerEdition} per edition`,
    );
  }

  const perSurface = new Map<string, number>();
  for (const slot of declared.slots) {
    if (!filled.has(slot.id)) continue;
    for (const surface of slot.surfaces) {
      perSurface.set(surface, (perSurface.get(surface) ?? 0) + 1);
    }
  }
  for (const [surface, count] of perSurface) {
    if (count > declared.maxPerSurface) {
      errors.push(
        `${count} filled creatives on the ${surface} surface exceed the cap of ${declared.maxPerSurface} per surface`,
      );
    }
  }

  return errors;
}
