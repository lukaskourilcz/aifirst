import { afterEach, describe, expect, it } from "vitest";
import { applyIllustrationProvider, loadEditorialConfig, validateEditorialConfig } from "../config";

afterEach(() => {
  delete process.env.IMAGE_PROVIDER;
});

describe("editorial configuration", () => {
  it("loads committed language, model and budget controls", async () => {
    const config = await loadEditorialConfig();
    expect(config.publishing.primaryLanguage).toBe("en");
    expect(config.translation.fullDailyEnabled).toBe(false);
    expect(config.translation.budgetPerRun).toBe(0.1);
    expect(config.budgets.warningCostPerRun).toBe(0.6);
    expect(config.budgets.hardCostPerRun).toBe(1.5);
    expect(config.budgets.monthlyWarning).toBe(20);
    expect(config.budgets.monthlyHardLimit).toBe(40);
    expect(config.models.profiles.standard!.writing).toBe("claude-opus-4-7");
    expect(config.models.profiles.economical!.writing).toBe("claude-sonnet-4-6");
    expect(config.illustration.provider).toBe("none");
  });

  it("rejects incomplete nested controls", () => {
    expect(validateEditorialConfig({ schemaVersion: 1 })).toEqual(expect.arrayContaining([
      "brand.name is required",
      "publishing must be an object",
      "article must be an object",
      "translation must be an object",
    ]));
  });

  it("uses committed illustration defaults for schedules with an optional validated override", async () => {
    const config = await loadEditorialConfig();
    config.illustration.provider = "nasa";
    expect(applyIllustrationProvider(config, "none", true)).toBe("nasa");
    expect(applyIllustrationProvider(config, "none", true, "picsum")).toBe("picsum");
    expect(applyIllustrationProvider(config, "fal", false)).toBe("fal");
    expect(() => applyIllustrationProvider(config, "none", true, "unknown")).toThrow("Unknown IMAGE_PROVIDER");
  });

  it("rejects unknown illustration providers", async () => {
    const config = await loadEditorialConfig();
    expect(validateEditorialConfig({ ...config, illustration: { provider: "unknown" } })).toContain(
      "illustration.provider must be none, fal, nasa or picsum",
    );
  });
});
