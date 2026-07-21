import { describe, expect, it } from "vitest";
import { loadEditorialConfig, validateEditorialConfig } from "../config";

describe("editorial configuration", () => {
  it("loads committed language, model and budget controls", async () => {
    const config = await loadEditorialConfig();
    expect(config.publishing.primaryLanguage).toBe("en");
    expect(config.translation.fullDailyEnabled).toBe(false);
    expect(config.translation.budgetPerRun).toBeNull();
    expect(config.models.profiles.standard!.writing).toBe("claude-opus-4-7");
    expect(config.models.profiles.economical!.writing).toBe("claude-sonnet-4-6");
  });

  it("rejects incomplete nested controls", () => {
    expect(validateEditorialConfig({ schemaVersion: 1 })).toEqual(expect.arrayContaining([
      "brand.name is required",
      "publishing must be an object",
      "article must be an object",
      "translation must be an object",
    ]));
  });
});
