import { describe, expect, it } from "vitest";
import { brand, localizedBrand } from "../brand";

describe("brand", () => {
  it("uses one untranslated name for readers and machines alike", () => {
    // Unified on 2026-08-09. The split existed so the new name could reach the
    // lockup before every indexed title moved; both now say the same thing.
    expect(brand.name).toBe("DNESKAi");
    expect(brand.wordmark).toBe(brand.name);
    expect(localizedBrand("en").name).toBe(localizedBrand("cs").name);
  });

  it("keeps the stable identifiers out of the rename", () => {
    // legalName and the repository are identifiers, not the publication name.
    expect(brand.legalName).toBe("Caught Up");
    expect(brand.repositoryName).toBe("aifirst");
  });

  it("exposes the agreed English and Czech promises", () => {
    expect(localizedBrand("en").tagline).toBe("The AI stories that actually mattered today.");
    expect(localizedBrand("cs").tagline).toBe("To podstatné z AI. Každý den.");
  });

  it("documents the preserved repository identifier", () => {
    expect(brand.repositoryName).toBe("aifirst");
  });
});
