import raw from "@/config/partner.json";
import { isDeclaredSlot } from "./banner";
import type { Locale } from "./i18n/config";

// The rate card is build-time configuration in exactly the sense
// `config/banner.json` is: a committed JSON file, no network, no ad server and
// no booking widget. It carries the commercial values only, which is why every
// word a reader sees lives in `lib/i18n/dictionaries.ts` instead. The owner
// sets a price and a booking destination by editing one file; nothing here
// invents either, so an unset price renders as "on request" rather than as a
// number nobody agreed to.
//
// The parser copies the posture of `lib/banner.ts`: it never throws, because it
// runs during static render, and anything malformed reads as absent. A broken
// rate card can therefore hide a package but can never sell one that the
// inventory does not have.

/** The packages the rate card can offer. A config entry outside this set is dropped. */
export const PARTNER_PACKAGE_IDS = ["belt", "rail", "edition"] as const;
export type PartnerPackageId = (typeof PARTNER_PACKAGE_IDS)[number];

/** What a price is quoted per. */
export const PARTNER_PERIODS = ["edition", "week", "month"] as const;
export type PartnerPeriod = (typeof PARTNER_PERIODS)[number];

/**
 * The in-edition sponsor block: the one paid unit that is not a banner slot, so
 * it is not declared in `config/banner.json` and needs its own placement id.
 */
export const SPONSOR_BLOCK_SLOT = "sponsor-block";

/** The currency the card is written in. A CZK rate card by contract. */
export const PARTNER_CURRENCY = "CZK";

export type PartnerPackage = {
  readonly id: PartnerPackageId;
  /** A declared `config/banner.json` slot id, or `sponsor-block`. */
  readonly slot: string;
  /** The agreed price, or `null` while the owner has not set one. */
  readonly priceCzk: number | null;
  readonly period: PartnerPeriod;
};

/**
 * Where a partner books. `external` is a plain outbound link to a storefront or
 * a calendar, `email` is a mailbox. Both are ordinary anchors: no embed, no
 * iframe and no form, so the content security policy is untouched. `display` is
 * the destination shown under the call to action, derived from the href rather
 * than written by hand, so it can never name a different host than it opens.
 */
export type PartnerBooking =
  | { readonly kind: "external"; readonly href: string; readonly display: string }
  | { readonly kind: "email"; readonly href: string; readonly display: string };

const config = raw as {
  schemaVersion: string;
  currency?: unknown;
  vatNote?: unknown;
  booking?: unknown;
  packages?: unknown;
};

function isPackageId(value: unknown): value is PartnerPackageId {
  return typeof value === "string" && (PARTNER_PACKAGE_IDS as readonly string[]).includes(value);
}

function isPeriod(value: unknown): value is PartnerPeriod {
  return typeof value === "string" && (PARTNER_PERIODS as readonly string[]).includes(value);
}

/** A placement the magazine actually renders: a declared banner slot or the sponsor block. */
export function isSellableSlot(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  return value === SPONSOR_BLOCK_SLOT || isDeclaredSlot(value);
}

/**
 * One package, or `null` when it is incomplete, names an unknown package id, or
 * points at a placement that does not exist. A price is optional and stays
 * `null` until the owner sets one; a price that is present but is not a whole
 * positive number is a broken entry rather than a free package, so the whole
 * package is dropped instead of being offered at an invented rate.
 */
export function parsePackage(value: unknown): PartnerPackage | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { id, slot, priceCzk, period } = value as Record<string, unknown>;
  if (!isPackageId(id)) return null;
  if (!isSellableSlot(slot)) return null;
  if (!isPeriod(period)) return null;

  let price: number | null = null;
  if (priceCzk !== null && priceCzk !== undefined) {
    if (typeof priceCzk !== "number" || !Number.isSafeInteger(priceCzk) || priceCzk <= 0) return null;
    price = priceCzk;
  }

  return { id, slot, priceCzk: price, period };
}

/**
 * The packages in a configured list, in configuration order. A malformed entry
 * is dropped rather than thrown on, and a repeated id keeps the first entry, so
 * the reader never meets the same package twice. Takes the list rather than
 * reading the module import so a test can feed it a fixture.
 */
export function selectPackages(entries: unknown): PartnerPackage[] {
  if (!Array.isArray(entries)) return [];
  const packages: PartnerPackage[] = [];
  const seen = new Set<PartnerPackageId>();
  for (const entry of entries) {
    const parsed = parsePackage(entry);
    if (parsed === null || seen.has(parsed.id)) continue;
    seen.add(parsed.id);
    packages.push(parsed);
  }
  return packages;
}

/** The packages this build offers. */
export function partnerPackages(): PartnerPackage[] {
  return selectPackages(config.packages);
}

const MAILTO = /^mailto:[^\s@,;:<>()[\]\\]+@[^\s@,;:<>()[\]\\]+\.[a-zA-Z]{2,}$/;

/**
 * The booking destination, or `null` while there is none. `kind: "none"` is the
 * shipped state and reads as no destination, which is what makes the empty
 * state honest instead of a dead link. An `http:` URL, a credentialled URL and
 * anything that is not a plain mailbox are refused the same way.
 */
export function parseBooking(value: unknown): PartnerBooking | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { kind, href } = value as Record<string, unknown>;
  if (typeof href !== "string" || href.trim() === "") return null;

  if (kind === "external") {
    try {
      const url = new URL(href);
      if (url.protocol !== "https:" || url.username || url.password) return null;
      return { kind: "external", href, display: url.host };
    } catch {
      return null;
    }
  }

  if (kind === "email") {
    if (!MAILTO.test(href)) return null;
    return { kind: "email", href, display: href.slice("mailto:".length) };
  }

  return null;
}

/** The configured booking destination, or `null` while the owner has not set one. */
export function partnerBooking(): PartnerBooking | null {
  return parseBooking(config.booking);
}

/**
 * The owner's wording about VAT, or an empty string while it is unsettled.
 * Whether a price is quoted with or without DPH is a commercial decision, so
 * the page states that it is unsettled rather than guessing either way.
 */
export function partnerVatNote(): string {
  return typeof config.vatNote === "string" ? config.vatNote.trim() : "";
}

/** Whether any package carries a real price, which is what makes the VAT question live. */
export function hasPricedPackage(packages: readonly PartnerPackage[]): boolean {
  return packages.some((entry) => entry.priceCzk !== null);
}

/** `6 900 Kč`, grouped the Czech way, with no decimals on a whole-crown rate. */
export function formatCzk(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-GB", {
    style: "currency",
    currency: PARTNER_CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Everything wrong with a rate card, as reader-independent messages.
 * `pnpm check:content` runs it over `config/partner.json` and fails the release
 * gate, so a package that points at a placement the magazine does not render,
 * or a price in the wrong shape, cannot reach a build. It takes the whole
 * configuration object rather than the module-level import so a test can feed
 * it a fixture.
 */
export function partnerRateCardErrors(input: unknown): string[] {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return ["configuration must be an object"];
  }
  const value = input as Record<string, unknown>;
  const errors: string[] = [];

  if (value.schemaVersion !== "partner-rate-card/1") {
    errors.push('schemaVersion must be "partner-rate-card/1"');
  }
  if (value.currency !== PARTNER_CURRENCY) {
    errors.push(`currency must be "${PARTNER_CURRENCY}"`);
  }
  if (value.vatNote !== undefined && typeof value.vatNote !== "string") {
    errors.push("vatNote must be a string");
  }

  const booking = value.booking;
  if (typeof booking !== "object" || booking === null || Array.isArray(booking)) {
    errors.push("booking must be an object");
  } else {
    const { kind } = booking as Record<string, unknown>;
    if (kind !== "none" && kind !== "external" && kind !== "email") {
      errors.push('booking.kind must be "none", "external" or "email"');
    } else if (kind !== "none" && parseBooking(booking) === null) {
      errors.push(
        'booking.href must be an https URL without credentials when kind is "external", or a mailto address when kind is "email"',
      );
    }
  }

  const packages = value.packages;
  if (!Array.isArray(packages) || packages.length === 0) {
    errors.push("packages must be a non-empty array");
    return errors;
  }

  const seen = new Set<string>();
  packages.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      errors.push(`package ${index} must be an object`);
      return;
    }
    const { id, slot } = entry as Record<string, unknown>;
    if (!isPackageId(id)) {
      errors.push(`package ${index}: id must be one of ${PARTNER_PACKAGE_IDS.join(", ")}`);
    } else if (seen.has(id)) {
      errors.push(`package "${id}" is configured twice`);
    } else {
      seen.add(id);
    }
    if (!isSellableSlot(slot)) {
      errors.push(
        `package ${index}: slot must be "${SPONSOR_BLOCK_SLOT}" or a slot declared in config/banner.json`,
      );
    }
    if (parsePackage(entry) === null && isPackageId(id) && isSellableSlot(slot)) {
      errors.push(
        `package "${String(id)}": period must be one of ${PARTNER_PERIODS.join(", ")} and priceCzk must be null or a whole positive number of crowns`,
      );
    }
  });

  return errors;
}
