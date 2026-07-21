import { describe, expect, it } from "vitest";
import { brand, localizedBrand } from "../brand";

describe("brand", () => {
  it("uses Caught Up without translating the name", () => {
    expect(brand.name).toBe("Caught Up");
    expect(localizedBrand("en").name).toBe(localizedBrand("cs").name);
  });

  it("exposes the agreed English and Czech promises", () => {
    expect(localizedBrand("en").tagline).toBe("The AI stories that actually mattered today.");
    expect(localizedBrand("cs").tagline).toBe("To podstatné z AI. Každý den.");
  });

  it("documents the preserved repository identifier", () => {
    expect(brand.repositoryName).toBe("aifirst");
  });
});
