import raw from "@/config/subscribe.json";
import { CONTENT_LANGS, type ContentLang } from "./i18n/config";

// The email channel is build-time configuration, not an integration. There is
// no list in this repository, no API key, no runtime handler and no reader
// record: a configured channel is a plain `<form method="post">` that posts the
// reader's address straight to the owner's provider, exactly the way the banner
// slot is a local image linked to one URL.
//
// Everything here is fail-closed. An empty or malformed configuration resolves
// to `null`, the rail renders the Atom link alone, and `form-action` stays at
// `'self'`. That is the shipped state: no provider has been chosen, so the site
// promises no inbox.
//
// `privacyNote` is required rather than optional on purpose. Collecting an
// address without a stated privacy line is the one thing this surface must not
// do, so a channel without one is treated as no channel at all instead of
// rendering a form under invented copy.

export type SubscribeChannel = {
  /** The provider's own name. Operational, never rendered to a reader. */
  provider: string;
  /** The absolute https endpoint the form posts to. */
  action: string;
  /** `action`'s origin, which is what `form-action` in the CSP needs. */
  origin: string;
  /** The field name the provider expects the address under. */
  emailField: string;
  /** Provider bookkeeping (list id, tags) carried as hidden inputs. */
  hiddenFields: Record<string, string>;
  /** The consent sentence shown under the field, in both content languages. */
  privacyNote: Record<ContentLang, string>;
};

/**
 * Form field names are restricted rather than free text: they end up as
 * `name` attributes on inputs, and providers only ever use simple identifiers
 * or bracketed paths such as `fields[email]`.
 */
const FIELD_NAME = /^[A-Za-z0-9_.[\]-]{1,64}$/;

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function parsePrivacyNote(value: unknown): Record<ContentLang, string> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const note: Partial<Record<ContentLang, string>> = {};
  for (const lang of CONTENT_LANGS) {
    const text = record[lang];
    if (!nonEmptyString(text)) return null;
    note[lang] = text;
  }
  return note as Record<ContentLang, string>;
}

function parseHiddenFields(value: unknown, emailField: string): Record<string, string> | null {
  if (value === undefined) return {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const fields: Record<string, string> = {};
  for (const [name, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!FIELD_NAME.test(name)) return null;
    if (name === emailField) return null;
    if (typeof entry !== "string") return null;
    fields[name] = entry;
  }
  return fields;
}

/**
 * One configured channel, or `null` when the configuration is empty, partial or
 * malformed. Never throws: it runs during static render, and a bad config must
 * cost the form rather than the build.
 */
export function parseSubscribeChannel(value: unknown): SubscribeChannel | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { provider, action, emailField, hiddenFields, privacyNote } = value as Record<string, unknown>;

  if (!nonEmptyString(provider)) return null;
  if (!nonEmptyString(emailField) || !FIELD_NAME.test(emailField)) return null;
  if (!nonEmptyString(action)) return null;

  let url: URL;
  try {
    url = new URL(action);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") return null;

  const fields = parseHiddenFields(hiddenFields, emailField);
  if (fields === null) return null;

  const note = parsePrivacyNote(privacyNote);
  if (note === null) return null;

  return {
    provider: provider.trim(),
    action: url.toString(),
    origin: url.origin,
    emailField,
    hiddenFields: fields,
    privacyNote: note,
  };
}

const channel = parseSubscribeChannel(raw as unknown);

/** The channel this build ships, or `null` while the site is Atom-only. */
export function subscribeChannel(): SubscribeChannel | null {
  return channel;
}

/**
 * The origin `form-action` has to allow, or `null` when nothing is configured.
 * `next.config.mjs` re-derives the same value from the same file with the same
 * rules, because a config file cannot import a TypeScript module; the unit test
 * asserts the two agree on what ships.
 */
export function subscribeFormAction(): string | null {
  return channel?.origin ?? null;
}

/**
 * Everything wrong with a subscribe configuration, as operator-facing messages.
 * A filled-but-broken config otherwise looks exactly like an empty one, so the
 * unit test runs this over the shipped file and fails the release gate on a
 * half-finished channel.
 */
export function subscribeConfigErrors(input: unknown): string[] {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return ["configuration must be an object"];
  }
  const value = input as Record<string, unknown>;
  const { provider, action, emailField, hiddenFields, privacyNote } = value;

  // The empty state is valid and is what ships: no provider, no action, no
  // note. It is only an error to fill some of them and not the rest.
  const touched = [provider, action, privacyNote].filter((entry) => entry !== null && entry !== undefined);
  if (touched.length === 0) return [];

  const errors: string[] = [];
  if (!nonEmptyString(provider)) errors.push("provider must be a non-empty string");
  if (!nonEmptyString(action)) {
    errors.push("action must be the provider's absolute https form endpoint");
  } else {
    try {
      const url = new URL(action);
      if (url.protocol !== "https:") errors.push("action must use https");
      if (url.username !== "" || url.password !== "") errors.push("action must carry no credentials");
    } catch {
      errors.push("action must be an absolute URL");
    }
  }
  if (!nonEmptyString(emailField) || !FIELD_NAME.test(emailField)) {
    errors.push("emailField must be the provider's field name for the address");
  } else if (parseHiddenFields(hiddenFields, emailField) === null) {
    errors.push("hiddenFields must map provider field names to string values and must not repeat emailField");
  }
  if (parsePrivacyNote(privacyNote) === null) {
    errors.push(`privacyNote must carry a consent sentence for every content language (${CONTENT_LANGS.join(", ")})`);
  }
  return errors;
}
