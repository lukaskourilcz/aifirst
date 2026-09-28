import { describe, expect, it } from "vitest";
import { moreNav, sectionNav, sectionOf } from "../sections";

describe("the one-section rule", () => {
  it("takes the first tag that maps to a section: the lead story's", () => {
    // 25. 9. 2026: a security story that also mentions Gemini and Microsoft.
    expect(sectionOf(["umela-inteligence", "kyberneticka-bezpecnost", "google-gemini", "microsoft", "ai-agenti"])).toBe("bezpecnost");
    // 22. 9.: California's data-centre law leads.
    expect(sectionOf(["regulace-ai", "kyberneticka-bezpecnost", "datova-centra"])).toBe("regulace");
    expect(sectionOf(["umela-inteligence", "datova-centra", "regulace"])).toBe("firmy-a-trh");
    expect(sectionOf(["mistral-ai", "umela-inteligence", "regulace"])).toBe("modely");
  });

  it("falls to Modely for generic tags and to nothing without tags", () => {
    expect(sectionOf(["umela-inteligence", "openai"])).toBe("modely");
    expect(sectionOf([])).toBeNull();
  });
});

describe("navigation", () => {
  it("has Dnes and five sections, and keeps Archiv in Více", () => {
    expect(sectionNav("cs").map((item) => item.label)).toEqual(["Dnes", "Modely", "Firmy a trh", "Bezpečnost", "Regulace", "Vývoj"]);
    expect(sectionNav("cs").some((item) => item.label === "Archiv")).toBe(false);
    expect(moreNav("cs").map((item) => item.label)).toContain("Archiv");
  });
});
