import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseSubscribeChannel,
  subscribeChannel,
  subscribeConfigErrors,
  subscribeFormAction,
} from "../subscribe.js";
import shipped from "../../config/subscribe.json";

const FILLED = {
  schemaVersion: "subscribe-channel/1",
  provider: "Example",
  action: "https://forms.example.com/lists/dneskai/subscribe",
  emailField: "email",
  hiddenFields: { "fields[list_id]": "42" },
  privacyNote: { cs: "Adresu používáme jen k odeslání vydání.", en: "We use the address only to send the edition." },
};

describe("parseSubscribeChannel", () => {
  it("accepts a complete channel and exposes its origin for the CSP", () => {
    const channel = parseSubscribeChannel(FILLED);
    expect(channel?.provider).toBe("Example");
    expect(channel?.action).toBe("https://forms.example.com/lists/dneskai/subscribe");
    expect(channel?.origin).toBe("https://forms.example.com");
    expect(channel?.hiddenFields).toEqual({ "fields[list_id]": "42" });
    expect(channel?.privacyNote.cs).toContain("vydání");
  });

  it("rejects a plaintext endpoint", () => {
    expect(parseSubscribeChannel({ ...FILLED, action: "http://forms.example.com/subscribe" })).toBeNull();
  });

  it("rejects an endpoint carrying credentials", () => {
    expect(parseSubscribeChannel({ ...FILLED, action: "https://user:pass@forms.example.com/subscribe" })).toBeNull();
  });

  it("rejects a relative endpoint", () => {
    expect(parseSubscribeChannel({ ...FILLED, action: "/subscribe" })).toBeNull();
  });

  it("rejects a missing or unusable email field name", () => {
    expect(parseSubscribeChannel({ ...FILLED, emailField: "" })).toBeNull();
    expect(parseSubscribeChannel({ ...FILLED, emailField: "e mail" })).toBeNull();
  });

  it("rejects hidden fields that are not strings, or that shadow the address field", () => {
    expect(parseSubscribeChannel({ ...FILLED, hiddenFields: { list: 42 } })).toBeNull();
    expect(parseSubscribeChannel({ ...FILLED, hiddenFields: { email: "x" } })).toBeNull();
  });

  it("refuses to collect an address without a consent line in both content languages", () => {
    expect(parseSubscribeChannel({ ...FILLED, privacyNote: null })).toBeNull();
    expect(parseSubscribeChannel({ ...FILLED, privacyNote: { cs: "Jen pro vydání." } })).toBeNull();
    expect(parseSubscribeChannel({ ...FILLED, privacyNote: { cs: "", en: "x" } })).toBeNull();
  });

  it("reads anything malformed as no channel rather than throwing", () => {
    for (const value of [null, undefined, 7, "channel", [], {}]) {
      expect(parseSubscribeChannel(value)).toBeNull();
    }
  });
});

describe("the shipped configuration", () => {
  it("is empty, so the reader stays Atom-only until the owner picks a provider", () => {
    expect(subscribeChannel()).toBeNull();
    expect(subscribeFormAction()).toBeNull();
  });

  it("carries no half-finished channel", () => {
    expect(subscribeConfigErrors(shipped)).toEqual([]);
  });

  it("names every missing part once a channel is started", () => {
    const errors = subscribeConfigErrors({ ...FILLED, provider: "Example", action: "ftp://x", privacyNote: null });
    expect(errors.join(" ")).toContain("action");
    expect(errors.join(" ")).toContain("privacyNote");
    expect(subscribeConfigErrors({ provider: null, action: null, privacyNote: null })).toEqual([]);
  });
});

describe("the content security policy", () => {
  /**
   * `next.config.mjs` cannot import the loader, so it re-derives the origin
   * from the same file. This keeps the duplicate honest: whatever the loader
   * resolves is what the header allows.
   */
  it("derives form-action from the same configuration the loader reads", () => {
    const config = fs.readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");
    expect(config).toContain("config/subscribe.json");
    expect(config).toContain("form-action 'self'");

    const origin = subscribeFormAction();
    const directive = origin ? `form-action 'self' ${origin}` : "form-action 'self'";
    expect(directive).toBe("form-action 'self'");
  });
});
